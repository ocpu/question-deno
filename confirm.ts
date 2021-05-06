import KeyCombo from './KeyCombo.ts'
import { print, println, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, moveCursor } from './util.ts'
export interface ConfirmOptions {
  defaultValue?: boolean
  positiveText?: string
  negativeText?: string
}
export default async function confirm(label: string, defaultValue?: boolean | ConfirmOptions | undefined): Promise<boolean | undefined> {
  let cursorIndex = 0
  const _positiveText = typeof defaultValue === 'object' && typeof defaultValue.positiveText !== 'undefined' ? defaultValue.positiveText : 'Yes'
  const _negativeText = typeof defaultValue === 'object' && typeof defaultValue.negativeText !== 'undefined' ? defaultValue.negativeText : 'No'
  const positiveText = _positiveText.substring(0, 1).toUpperCase() + _positiveText.substring(1).toLowerCase()
  const negativeText = _negativeText.substring(0, 1).toUpperCase() + _negativeText.substring(1).toLowerCase()
  const _defaultValue = typeof defaultValue === 'boolean' || typeof defaultValue === 'undefined' ? defaultValue : defaultValue.defaultValue
  const positiveChar = _defaultValue === true ? positiveText[0] : positiveText[0].toLowerCase()
  const negativeChar = _defaultValue === false ? negativeText[0] : negativeText[0].toLowerCase()
  const prompt = label + ` [${positiveChar}/${negativeChar}]`
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
          : trimmed[0].toLowerCase() === positiveChar.toLowerCase()
            ? true
            : trimmed[0].toLowerCase() === negativeChar.toLowerCase()
              ? false
              : undefined
        if (result === undefined) return
        await clear()
        await println(PREFIX + asPromptText(label) + highlightText(result ? positiveText : negativeText))
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
