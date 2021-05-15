import KeyCombo from './KeyCombo.ts'
import { print, println, HIDE_CURSOR, SHOW_CURSOR, PREFIX, asPromptText, CLEAR_LINE, highlightText, createRenderer, PRIMARY_COLOR, RESET_COLOR, moveCursor } from './util.ts'

interface Option<T> {
  label: string
  value: T
  onSelect?(): number[]
  onDeselect?(index: number): boolean
}

/**
 * Creates a list of selectable items from which one item will be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 * 
 * The options parameter can also be a plain object where the key is the label and the value is a
 * object definition how the option is represented in the list and with a value. The representation
 * keys are:
 * - `dependencies`: This is a value that takes a index, label, or a list of indices and labels to
 *   express the reliance of a different option. So whenever any dependant option is select this one
 *   is too. Same for deselects.
 * - `selected`: This makes the option selected by default. If the option depends on any other options
 *   They will also be selected.
 * 
 * ```typescript
 * const options = {
 *   'Value 1': { value: 1 },
 *   'Value 2': { value: 2 },
 *   'Value 3': { value: 3 },
 * }
 * ```
 * 
 * ```typescript
 * const options = {
 *   'Value 1': { value: 1 },
 *   'Value 2': { value: 2, dependencies: ['Value 1'] },
 *   'Value 3': { value: 3, selected: true },
 * }
 * ```
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
export default async function checkbox<T = string>(label: string, options: T[] | Record<string, ObjectOption<T>>): Promise<T[] | undefined> {
  const selectedIndices: number[] = []
  const defaultSelected: number[] = []
  const possibleOptions: Option<T>[] = Array.isArray(options)
    ? getOptionsFromArray(options, defaultSelected)
    : getOptionsFromObject(options, defaultSelected)
  defaultSelected.forEach(select)

  if (possibleOptions.length == 0) return []
  let cursorIndex = 0
  await print(HIDE_CURSOR)

  return createRenderer({
    label,
    clear: () => print((CLEAR_LINE + moveCursor(1, 'up')).repeat(possibleOptions.length) + CLEAR_LINE),
    async prompt() {
      await println(PREFIX + asPromptText(label))
      for (let index = 0; index < possibleOptions.length; index++) {
        const option = possibleOptions[index].label
        const current = cursorIndex === index ? PRIMARY_COLOR + '>' : ' '
        const selected = selectedIndices.includes(index) ? '☒' : '☐'
        await print(`${current} ${selected} ${option}${RESET_COLOR}${index + 1 === possibleOptions.length ? '' : '\n'}`)
      }
    },
    actions: [
      [KeyCombo.parse('up'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(cursorIndex - 1, 0), possibleOptions.length - 1)
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('down'), async ({clear,prompt}) => {
        const newIndex = Math.min(Math.max(cursorIndex + 1, 0), possibleOptions.length - 1)
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
        const newIndex = possibleOptions.length - 1
        if (newIndex === cursorIndex) return
        cursorIndex = newIndex
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('space'), async ({clear,prompt}) => {
        if (selectedIndices.includes(cursorIndex)) deselect(cursorIndex)
        else select(cursorIndex)
        await clear()
        await prompt()
      }],
      [KeyCombo.parse('enter'), async ({clear}) => {
        await clear()
        const result = selectedIndices.map(index => possibleOptions[index])
        const text = result.length === 0
          ? highlightText('<empty>')
          : result.map(item => highlightText(item.label)).join(', ')
        await println(SHOW_CURSOR + PREFIX + asPromptText(label) + text)
        return { result: result.map(it => it.value) }
      }]
    ]
  })

  function select(index: number) {
    selectedIndices.push(index)
    let onSelect: Option<T>['onSelect'] | undefined
    if (typeof (onSelect = possibleOptions[index].onSelect) === 'function') {
      for (const other of onSelect().filter(index => !selectedIndices.includes(index))) {
        if (selectedIndices.includes(other)) continue
        select(other)
      }
    }
  }

  function deselect(index: number) {
    selectedIndices.splice(selectedIndices.indexOf(index), 1)
    for (const selectedIndex of selectedIndices.slice()) {
      let onDeselect: Option<T>['onDeselect'] | undefined
      if (typeof (onDeselect = possibleOptions[selectedIndex].onDeselect) === 'function') {
        if (onDeselect(index)) deselect(selectedIndex)
      }
    }
  }
}

function getOptionsFromArray<T>(options: T[], _defaultSelected: number[]): Option<T>[] {
  return options.map(value => ({ label: value as unknown as string, value }))
}

export interface ObjectOption<T> {
  value: T
  dependencies?: string | number | (string | number)[]
  selected?: boolean
}

function getOptionsFromObject<T>(object: Record<string, ObjectOption<T>>, defaultSelected: number[]): Option<T>[] {
  return Object.entries(object).map(([label, objectOption], index, allEntries) => {
    const option: Option<T> = { label, value: objectOption.value }
    if (typeof objectOption.dependencies !== 'undefined') {
      const dependencies: number[] = []
      if (typeof objectOption.dependencies === 'string') dependencies.push(allEntries.findIndex(([label]) => label === objectOption.dependencies))
      else if (typeof objectOption.dependencies === 'number') dependencies.push(objectOption.dependencies)
      else if (Array.isArray(objectOption.dependencies) && objectOption.dependencies.every(dep => ['string', 'number'].includes(typeof dep))) {
        for (const dep of objectOption.dependencies) {
          if (typeof dep === 'string') dependencies.push(allEntries.findIndex(([label]) => label === objectOption.dependencies))
          else dependencies.push(dep)
        }
      }
      const deps = dependencies.filter(it => it >= 0 && it < allEntries.length)
      option.onSelect = () => deps
      option.onDeselect = index => deps.includes(index)
    }
    if (objectOption.selected === true) defaultSelected.push(index)

    return option
  })
}
