import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, MOVE_UP_1, highlightText, createRenderer, PRIMARY_COLOR, RESET_COLOR, moveCursor } from './util.ts'

/**
 * Creates a list of selectable items from which one item will be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow will move the selected item up once if able.
 * - `Down` arrow will move the selected item down once if able.
 * - `Space` will mark/unmark the selected item.
 * - `Enter` will return all marked items in a list.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The marked options or `undefined` if canceled or empty.
 */
export default async function checkbox(label: string, options: string[]): Promise<string[] | undefined> {
  if (options.length == 0) return []
  let cursorIndex = 0
  const selectedIndices: number[] = []
  await print(HIDE_CURSOR)

  return createRenderer({
    label,
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(options.length) + CLEAR_LINE),
    async prompt() {
      await println(PREFIX + asPromptText(label))
      for (let index = 0; index < options.length; index++) {
        const option = options[index]
        const current = cursorIndex === index ? PRIMARY_COLOR + '>' : ' '
        const selected = selectedIndices.includes(index) ? '☒' : '☐'
        await print(`${current} ${selected} ${option}${RESET_COLOR}${index + 1 === options.length ? '' : '\n'}`)
      }
    },
    actions: [
      [KeyCombo.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(cursorIndex - 1, 0), options.length - 1)
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(cursorIndex + 1, 0), options.length - 1)
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('home'), async ({clear,prompt}) => {
        const newIndex = 0
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('end'), async ({clear,prompt}) => {
        const newIndex = options.length - 1
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('space'), async ({clear,prompt}) => {
        const indexOfIndex = selectedIndices.indexOf(cursorIndex)
        if (indexOfIndex !== -1) selectedIndices.splice(indexOfIndex, 1)
        else selectedIndices.push(cursorIndex)
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('enter'), async ({clear}) => {
        await clear()
        const result = selectedIndices.map(index => options[index])
        const text = result.length === 0
          ? highlightText('<empty>')
          : result.map(item => highlightText(item)).join(', ')
        await println(SHOW_CURSOR + PREFIX + asPromptText(label) + text)
        return { result }
      }]
    ]
  })
}
