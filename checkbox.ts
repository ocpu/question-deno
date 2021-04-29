import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, MOVE_UP_1, highlightText, createRenderer, PRIMARY_COLOR, RESET_COLOR, moveCursor } from './util.ts'

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
