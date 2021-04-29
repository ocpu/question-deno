import KeyCombo from './KeyCombo.ts'
import { Keypress, readKeypress } from 'https://deno.land/x/keypress@0.0.7/mod.ts'

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
export function highlightText(text: string, shouldHighlight: boolean = true, reset: boolean = true) {
  if (shouldHighlight) {
    if (reset) return PRIMARY_COLOR + text + RESET_COLOR
    return PRIMARY_COLOR + text
  } else {
    if (reset) return text + RESET_COLOR
    return text
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
export function print(text: string, writer: Deno.Writer = Deno.stdout) {
  return writer.write(encoder.encode(text))
}
export function println(text: string, writer: Deno.Writer = Deno.stdout) {
  return writer.write(encoder.encode(text + '\n'))
}
interface CreateRendererOptions<R> {
  label: string,
  prompt(): any|Promise<any>,
  clear(): any|Promise<any>,
  actions:[KeyCombo|KeyCombo[],(options: CreateRendererOptions<R>)=>void|{result:R}|Promise<void|{result:R}>][],
  defaultAction?(keypress: Keypress, options: CreateRendererOptions<R>): void|{result:R}|Promise<void|{result:R}>
}
export async function createRenderer<R>(options: CreateRendererOptions<R>): Promise<R | undefined> {
  const cancelKeyCombo = KeyCombo.parse('Ctrl+c')
  const exitKeyCombo = KeyCombo.parse('Ctrl+d')

  options.prompt()
  keys:for await (const keypress of readKeypress()) {
    if (cancelKeyCombo.test(keypress)) {
      await options.clear()
      println(SHOW_CURSOR + PREFIX + asPromptText(options.label) + highlightText(`<cancel>`))
      return undefined
    } else if (exitKeyCombo.test(keypress)) {
      println(SHOW_CURSOR)
      Deno.exit(0)
    }

    for (const [keyCombos, handler] of options.actions) {
      if (Array.isArray(keyCombos) ? keyCombos.some(keyCombo => keyCombo.test(keypress)) : keyCombos.test(keypress)) {
        const result = await handler(options)
        if (result === undefined) {
          continue keys
        } else {
          return result.result
        }
      }
    }
    if (options.defaultAction !== undefined) {
      const result = await options.defaultAction(keypress, options)
      if (result === undefined) {
        continue keys
      } else {
        return result.result
      }
    }
  }
}
