import KeyCombo from './KeyCombo.ts'
import { print, println, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor } from './util.ts'

export default async function confirm(label: string, defaultValue?: boolean | undefined): Promise<boolean | undefined> {
  let cursorIndex = 0
  const prompt = label + (typeof defaultValue === 'boolean' ? defaultValue ? ' [Y/n]' : ' [y/N]' : ' [y/n]')
  let text = ''
  return createRenderer({
    label,
    clear: () => print(CLEAR_LINE),
    prompt: () => print(PREFIX + asPromptText(prompt) + text + moveCursor(Math.abs(cursorIndex - text.length), 'left')),
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
        const trimmed = text.trimLeft()
        const result = trimmed[0] === undefined
          ? typeof defaultValue === 'boolean'
            ? defaultValue
            : undefined
          : trimmed[0].toLowerCase() === 'y'
            ? true
            : trimmed[0].toLowerCase() === 'n'
              ? false
              : undefined
        if (result === undefined) return
        await clear()
        await println(PREFIX + asPromptText(label) + highlightText(result ? 'Yes' : 'No'))
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
