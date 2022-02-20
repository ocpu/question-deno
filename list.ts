import { KeyCombos } from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor, PRIMARY_COLOR, RESET_COLOR } from './util.ts'
import config from './config.ts'

export interface ListOptions {
  /**
   * The maximum amount of items visible at one time.
   * 
   * Default: The amount of items passed in.
   */
  windowSize?: number
  /**
   * The pattern to repeat for when there are more items either above or below the current window.
   * 
   * Default: `-`
   */
  moreContentPattern?: string
  /**
   * The pattern to repeat for when there are no additional items either above or below the current window.
   * 
   * Default: `=`
   */
  noMoreContentPattern?: string
  /**
   * Whether or not to offset the selected item while going through the item list.
   * If there are more items above or below (if enabled) it will select the next to last
   * or first of the window always leaving 1 item offset if more items are available.
   * 
   * Default: `true`
   */
  offsetWindowScroll?: boolean
}

const DEFAULT_NO_MORE_CONTENT_PATTERN = '='
const DEFAULT_MORE_CONTENT_PATTERN = '-'
const CURSOR_CHARACTER = '>'
const NON_CURSOR_CHARACTER = ' '
const LINE_COLOR_CURSOR = PRIMARY_COLOR
const LINE_COLOR_UNSELECTED = '\x1b[90m'

/**
 * Creates a list of selectable items from which one item can be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 * 
 * The options parameter can also be a plain object where the key is the label and the value is the
 * result.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow will move the selected item up once if able.
 * - `Down` arrow will move the selected item down once if able.
 * - `Home` will move the selected item up to the start if able.
 * - `End` will move the selected item down to the end if able.
 * - `PageUp` will move the selected item up by the actual list window size if able.
 * - `PageDown` will move the selected item down by the actual list window size if able.
 * - `Enter` will return the currently selected item.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The selected option or `undefined` if canceled or empty.
 */
export default async function list<T = string>(label: string, options: string[] | Record<string, T>, listOptions?: ListOptions): Promise<T | undefined> {
  const possibleOptions: { label: string, value: T }[] = []
  if (Array.isArray(options)) options.forEach(value => possibleOptions.push({ value: value as unknown as T, label: value }))
  else Object.entries(options).forEach(([label, value]) => possibleOptions.push({ value, label }))

  if (possibleOptions.length === 0) return undefined
  let selectedIndex = 0
  let indexOffset = 0
  let printedLines = 1
  const desiredWindowSize = Math.min(possibleOptions.length, Math.max(1, listOptions?.windowSize ?? possibleOptions.length))
  const noMoreContentPattern = listOptions?.noMoreContentPattern ?? DEFAULT_NO_MORE_CONTENT_PATTERN
  const moreContentPattern = listOptions?.moreContentPattern ?? DEFAULT_MORE_CONTENT_PATTERN
  const longestItemLabelLength = Math.max(15, possibleOptions.map(it => it.label.length).sort((a, b) => b - a)[0] + 4)
  await print(HIDE_CURSOR)
  return createRenderer({
    label,
    onExit: () => print(SHOW_CURSOR),
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(printedLines - 1) + CLEAR_LINE),
    async prompt() {
      const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
      const showNarrowWindow = actualWindowSize < possibleOptions.length

      let out = PREFIX + asPromptText(label) + '\n'
      if (showNarrowWindow) {
        if (indexOffset !== 0) out += moreContentPattern.repeat(Math.ceil(longestItemLabelLength / moreContentPattern.length)).slice(0, longestItemLabelLength) + '\n'
        else out += noMoreContentPattern.repeat(Math.ceil(longestItemLabelLength / noMoreContentPattern.length)).slice(0, longestItemLabelLength) + '\n'
      }

      for (let index = 0; index < actualWindowSize; index++) {
        const option = possibleOptions[indexOffset + index].label
        const lineColor = selectedIndex === indexOffset + index ? LINE_COLOR_CURSOR : LINE_COLOR_UNSELECTED
        const current = selectedIndex === indexOffset + index
          ? CURSOR_CHARACTER
          : NON_CURSOR_CHARACTER
        out += `${lineColor}${current} ${option}${RESET_COLOR}${index + 1 === actualWindowSize ? '' : '\n'}`
      }

      if (showNarrowWindow) {
        if (indexOffset + actualWindowSize !== possibleOptions.length) out += '\n' + moreContentPattern.repeat(Math.ceil(longestItemLabelLength / moreContentPattern.length)).slice(0, longestItemLabelLength)
        else out += '\n' + noMoreContentPattern.repeat(Math.ceil(longestItemLabelLength / noMoreContentPattern.length)).slice(0, longestItemLabelLength)
      }
      await print(out)
      printedLines = actualWindowSize + 1 + (showNarrowWindow ? 2 : 0)
    },
    actions: [
      [KeyCombos.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex - 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        
        const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
        const offsetWindowScroll = actualWindowSize > 1 && (listOptions?.offsetWindowScroll ?? true)
        
        if (offsetWindowScroll && selectedIndex !== 0) indexOffset = selectedIndex - 1 < indexOffset ? selectedIndex - 1 : indexOffset
        else indexOffset = selectedIndex < indexOffset ? selectedIndex : indexOffset
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex + 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        
        const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
        const offsetWindowScroll = actualWindowSize > 1 && (listOptions?.offsetWindowScroll ?? true)
        
        if (offsetWindowScroll && selectedIndex !== possibleOptions.length - 1) indexOffset = selectedIndex >= indexOffset + actualWindowSize - 2 ? selectedIndex - actualWindowSize + 2 : indexOffset
        else indexOffset = selectedIndex >= indexOffset + actualWindowSize - 1 ? selectedIndex - actualWindowSize + 1 : indexOffset
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('home'), async ({clear,prompt}) => {
        const newIndex = 0
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        indexOffset = 0
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('end'), async ({clear,prompt}) => {
        const newIndex = possibleOptions.length - 1
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
        indexOffset = Math.max(0, newIndex - actualWindowSize + 1)
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('pageup'), async ({clear,prompt}) => {
        const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
        const newIndex = Math.max(0, selectedIndex - actualWindowSize)

        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        indexOffset = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('pagedown'), async ({clear,prompt}) => {
        const actualWindowSize = Math.min(desiredWindowSize, Deno.consoleSize(config.writer.rid).rows - 3)
        const offsetWindowScroll = actualWindowSize > 1 && (listOptions?.offsetWindowScroll ?? true)

        const newIndex = Math.min(possibleOptions.length - 1, selectedIndex + actualWindowSize)
        if (newIndex === selectedIndex) return

        selectedIndex = newIndex
        indexOffset = Math.min(possibleOptions.length - actualWindowSize - 1, newIndex)
        if (indexOffset === possibleOptions.length - actualWindowSize - 1 && offsetWindowScroll) {
          indexOffset += 1
        }
        await clear()
        await prompt()
      }],
      [KeyCombos.parse('enter'), async ({clear}) => {
        await clear()
        await println(PREFIX + asPromptText(label) + highlightText(possibleOptions[selectedIndex].label))
        return { result: possibleOptions[selectedIndex].value }
      }]
    ]
  })
}
