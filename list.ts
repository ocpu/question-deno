import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor } from './util.ts'

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
  const windowSize = Math.min(possibleOptions.length, Math.max(1, listOptions?.windowSize ?? possibleOptions.length))
  const noMoreContentPattern = listOptions?.noMoreContentPattern ?? '='
  const moreContentPattern = listOptions?.moreContentPattern ?? '-'
  const longestItemLabelLength = Math.max(15, possibleOptions.map(it => it.label.length).sort((a, b) => b - a)[0] + 4)
  const showNarrowWindow = windowSize < possibleOptions.length
  const offsetWindowScroll = listOptions?.offsetWindowScroll ?? true
  await print(HIDE_CURSOR)
  return createRenderer({
    label,
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(printedLines - 1) + CLEAR_LINE),
    async prompt() {
      let out = PREFIX + asPromptText(label) + '\n'
      if (showNarrowWindow) {
        if (indexOffset !== 0) out += moreContentPattern.repeat(Math.ceil(longestItemLabelLength / moreContentPattern.length)).slice(0, longestItemLabelLength) + '\n'
        else out += noMoreContentPattern.repeat(Math.ceil(longestItemLabelLength / noMoreContentPattern.length)).slice(0, longestItemLabelLength) + '\n'
      }

      for (let index = 0; index < windowSize; index++) {
        const option = possibleOptions[indexOffset + index].label
        out += highlightText('  ' + option, { shouldHighlight: selectedIndex === indexOffset + index }) + (index + 1 === windowSize ? '' : '\n')
      }

      if (showNarrowWindow) {
        if (indexOffset + windowSize !== possibleOptions.length) out += '\n' + moreContentPattern.repeat(Math.ceil(longestItemLabelLength / moreContentPattern.length)).slice(0, longestItemLabelLength)
        else out += '\n' + noMoreContentPattern.repeat(Math.ceil(longestItemLabelLength / noMoreContentPattern.length)).slice(0, longestItemLabelLength)
      }
      await print(out)
      printedLines = windowSize + 1 + (showNarrowWindow ? 2 : 0)
    },
    actions: [
      [KeyCombo.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex - 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        if (offsetWindowScroll && selectedIndex !== 0) indexOffset = selectedIndex - 1 < indexOffset ? selectedIndex - 1 : indexOffset
        else indexOffset = selectedIndex < indexOffset ? selectedIndex : indexOffset
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex + 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        if (offsetWindowScroll && selectedIndex !== possibleOptions.length - 1) indexOffset = selectedIndex >= indexOffset + windowSize - 2 ? selectedIndex - windowSize + 2 : indexOffset
        else indexOffset = selectedIndex >= indexOffset + windowSize - 1 ? selectedIndex - windowSize + 1 : indexOffset
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('enter'), async ({clear}) => {
        await clear()
        await println(SHOW_CURSOR + PREFIX + asPromptText(label) + highlightText(possibleOptions[selectedIndex].label))
        return { result: possibleOptions[selectedIndex].value }
      }]
    ]
  })
}
