import KeyCombo from './KeyCombo.ts'
import { print, println, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor } from './util.ts'

export default async function input(label: string, defaultValue?: string | undefined): Promise<string | undefined> {
  let cursorIndex = 0
  const prompt = asPromptText(label) + (typeof defaultValue === 'string' ? '[' + defaultValue + '] ' : '')
  let text = ''
  return createRenderer({
    label,
    clear: () => print(CLEAR_LINE),
    prompt: () => print(PREFIX + prompt + text + moveCursor(Math.abs(cursorIndex - text.length), 'left')),
    actions: [
      [KeyCombo.parse('left'), async ({clear,prompt}) => {
        if (text.length === 0) return
        const newIndex = Math.min(Math.max(cursorIndex - 1, 0), text.length)
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('right'), async ({clear,prompt}) => {
        if (text.length === 0) return
        const newIndex = Math.min(Math.max(cursorIndex + 1, 0), text.length)
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [[KeyCombo.parse('up'), KeyCombo.parse('home')], async ({clear,prompt}) => {
        if (text.length === 0) return
        if (cursorIndex === 0) return
        cursorIndex = 0
        await clear()
        await prompt()
      }],
      [[KeyCombo.parse('down'), KeyCombo.parse('end')], async ({clear,prompt}) => {
        if (text.length === 0) return
        if (cursorIndex === text.length) return
        cursorIndex = text.length
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('backspace'), async ({clear,prompt}) => {
        if (text.length === 0) return
        if (cursorIndex === 0) return
        text = text.slice(0, cursorIndex - 1) + text.slice(cursorIndex)
        cursorIndex--
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('delete'), async ({clear,prompt}) => {
        if (text.length === 0) return
        if (cursorIndex === text.length) return
        text = text.slice(0, cursorIndex) + text.slice(cursorIndex + 1)
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('enter'), async ({clear}) => {
        const trimmed = text.trim()
        const result = trimmed.length === 0 ? defaultValue ?? trimmed : trimmed
        await clear()
        await println(PREFIX + asPromptText(label) + highlightText(result.length === 0 ? '<empty>' : result))
        return { result }
      }]
    ],
    async defaultAction(keypress, options) {
      if (!keypress.ctrlKey && !keypress.metaKey && keypress.keyCode !== undefined) {
        text = text.slice(0, cursorIndex) + keypress.sequence + text.slice(cursorIndex)
        cursorIndex++
        await options.clear()
        await options.prompt()
      }
    }
  })
}
