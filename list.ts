import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor } from './util.ts'

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
export default async function list<T = string>(label: string, options: string[] | Record<string, T>): Promise<T | undefined> {
  const possibleOptions: { label: string, value: T }[] = []
  if (Array.isArray(options)) options.forEach(value => possibleOptions.push({ value: value as unknown as T, label: value }))
  else Object.entries(options).forEach(([label, value]) => possibleOptions.push({ value, label }))

  if (possibleOptions.length === 0) return undefined
  let selectedIndex = 0
  await print(HIDE_CURSOR)
  return createRenderer({
    label,
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(possibleOptions.length) + CLEAR_LINE),
    async prompt() {
      await println(PREFIX + asPromptText(label))
      for (let index = 0; index < possibleOptions.length; index++) {
        const option = possibleOptions[index].label
        await print(highlightText('  ' + option, { shouldHighlight: selectedIndex === index }) + (index + 1 === possibleOptions.length ? '' : '\n'))
      }
    },
    actions: [
      [KeyCombo.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex - 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex + 1, 0), possibleOptions.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
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
