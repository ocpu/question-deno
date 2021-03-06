import KeyCombo, { KeyCombos } from './KeyCombo.ts'
import { Keypress, readKeypress } from 'https://deno.land/x/keypress@0.0.7/mod.ts'
import questionConfig from './config.ts';

export const PRIMARY_COLOR = '\x1b[94m'
export const RESET_COLOR = '\x1b[0m'
export const HIDE_CURSOR = '\x1b[?25l'
export const SHOW_CURSOR = '\x1b[?25h'
export const CLEAR_LINE = '\x1b[500D\x1b[K'
export const MOVE_UP_1 = '\x1b[1A'
export const PREFIX = '\x1b[32m?\x1b[0m '
export function asPromptText(text: string, reset: boolean = true) {
  if (reset) return `\x1b[0;1m${text}\x1b[0m `
  return `\x1b[0;1m${text} `
}
type LuminosityType = 'light' | 'dark'
type ColorType = 'grey' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'cyan'
type Color = `${LuminosityType}${Capitalize<ColorType>}`
const COLORS: { [C in Color]: number } = {
  darkGrey: 30,
  darkRed: 31,
  darkYellow: 32,
  darkGreen: 33,
  darkBlue: 34,
  darkPurple: 35,
  darkCyan: 36,
  lightGrey: 90,
  lightRed: 91,
  lightYellow: 92,
  lightGreen: 93,
  lightBlue: 94,
  lightPurple: 95,
  lightCyan: 96,
}
export const PRIMARY_COLOR_NAME: Color = 'lightBlue'
export function highlightText(text: string, { shouldHighlight = true, reset = true, underline = false, color = PRIMARY_COLOR_NAME }: {shouldHighlight?: boolean, reset?: boolean, color?: Color, underline?: boolean } = {}) {
  const extra = (shouldHighlight ? '' : '\x1b[') + (underline ? '4' : '') + (shouldHighlight ? ';' : 'm')
  if (shouldHighlight) {
    if (reset) return '\x1b[' + extra + COLORS[color] + 'm' + text + RESET_COLOR
    return '\x1b[' + extra + COLORS[color] + 'm' + text
  } else {
    if (reset) return extra + text + RESET_COLOR
    return extra + text
  }
}
const directionToSpecifier = {
  'up': 'A',
  'down': 'B',
  'left': 'D',
  'right': 'C',
}
export function moveCursor(amount: number, direction: keyof typeof directionToSpecifier) {
  return amount === 0 ? '' : `\x1b[${amount}${directionToSpecifier[direction]}`
}
const encoder = new TextEncoder()
export function print(text: string, writer: Deno.Writer = questionConfig.writer) {
  return writer.write(encoder.encode(text))
}
export function println(text: string, writer: Deno.Writer = questionConfig.writer) {
  return writer.write(encoder.encode(text + '\n'))
}
interface CreateRendererOptions<R> {
  label: string
  prompt(): any|Promise<any>
  clear(): any|Promise<any>
  actions:[KeyCombos,(options: CreateRendererOptions<R>)=>void|{result:R}|Promise<void|{result:R}>][]
  defaultAction?(keypress: Keypress, options: CreateRendererOptions<R>): void|{result:R}|Promise<void|{result:R}>
  onExit?(): any|Promise<any>
}
export async function createRenderer<R>(options: CreateRendererOptions<R>): Promise<R | undefined> {
  const cancelKeyCombo = KeyCombo.parse('Ctrl+c')
  const exitKeyCombo = KeyCombo.parse('Ctrl+d')

  if (options.onExit) {
    window.addEventListener('unload', options.onExit)
  }
  await options.prompt()
  keys:for await (const keypress of readKeypress(questionConfig.keypressReader)) {
    if (cancelKeyCombo.test(keypress)) {
      await options.clear()
      if (options.onExit) {
        await options.onExit()
        window.removeEventListener('unload', options.onExit)
      }
      await println(PREFIX + asPromptText(options.label) + highlightText(`<cancel>`))
      return undefined
    } else if (exitKeyCombo.test(keypress)) {
      await options.clear()
      await println(PREFIX + asPromptText(options.label) + highlightText(`<force close>`))
      Deno.exit(0)
    }

    for (const [keyCombos, handler] of options.actions) {
      if (keyCombos.test(keypress)) {
        const result = await handler(options)
        if (result === undefined) {
          continue keys
        } else {
          if (options.onExit) {
            await options.onExit()
            window.removeEventListener('unload', options.onExit)
          }
          return result.result
        }
      }
    }
    if (options.defaultAction !== undefined) {
      const result = await options.defaultAction(keypress, options)
      if (result === undefined) {
        continue keys
      } else {
        if (options.onExit) {
          await options.onExit()
          window.removeEventListener('unload', options.onExit)
        }
        return result.result
      }
    }
  }
}
