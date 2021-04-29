import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, MOVE_UP_1, highlightText, createRenderer, moveCursor } from './util.ts'

export default async function list(label: string, options: string[]): Promise<string | undefined> {
  if (options.length === 0) return undefined
  let selectedIndex = 0
  await print(HIDE_CURSOR)
  return createRenderer({
    label,
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(options.length) + CLEAR_LINE),
    async prompt() {
      await println(PREFIX + asPromptText(label))
      for (let index = 0; index < options.length; index++) {
        const option = options[index]
        await print(highlightText('  ' + option, selectedIndex === index) + (index + 1 === options.length ? '' : '\n'))
      }
    },
    actions: [
      [KeyCombo.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex - 1, 0), options.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(selectedIndex + 1, 0), options.length - 1)
        if (newIndex === selectedIndex) return
        selectedIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('enter'), async ({clear}) => {
        await clear()
        await println(SHOW_CURSOR + PREFIX + asPromptText(label) + highlightText(options[selectedIndex]))
        return { result: options[selectedIndex] }
      }]
    ]
  })
}
