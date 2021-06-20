import confirm, { ConfirmOptions } from './confirm.ts'
import checkbox, { CheckboxOptions, ObjectOption } from './checkbox.ts'
import list, { ListOptions } from './list.ts'
import input from './input.ts'
import password from './password.ts'

/**
 * Creates a list of selectable items from which one item can be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow will move the selected item up once if able.
 * - `Down` arrow will move the selected item down once if able.
 * - `Enter` will return the currently selected item.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param type The list type.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The selected option or `undefined` if canceled or empty.
 */
export default function question(type: 'list', label: string, options: string[], listOptions?: ListOptions): Promise<string | undefined>;
/**
 * Creates a list of selectable items from which one item can be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 * 
 * The options parameter can also be a plain object where the key is the label and the value is the
 * result if that option was picked.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow will move the selected item up once if able.
 * - `Down` arrow will move the selected item down once if able.
 * - `Enter` will return the currently selected item.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param type The list type.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The selected option or `undefined` if canceled or empty.
 */
export default function question<T>(type: 'list', label: string, options: Record<string, T>, listOptions?: ListOptions): Promise<T | undefined>;
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
 * @param type The checkbox type.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The marked options or `undefined` if canceled or empty.
 */
export default function question(type: 'checkbox', label: string, options: string[], checkboxOptions?: CheckboxOptions): Promise<string[] | undefined>;
/**
 * Creates a list of selectable items from which one item will be chosen. If no items are available
 * to be selected this will return `undefined` without a question prompt.
 * 
 * The options parameter is a plain object where the key is the label and the value is a
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
 * @param type The checkbox type.
 * @param label The label the question will have.
 * @param options The options the user has to choose from.
 * @returns The marked options or `undefined` if canceled or empty.
 */
export default function question<T>(type: 'checkbox', label: string, options: Record<string, ObjectOption<T>>, checkboxOptions?: CheckboxOptions): Promise<T[] | undefined>;
/**
 * Create a confirmation question that resolves to a true or false based on user input. It
 * takes an `undefined`, `true`, or `false` value as the default value. Each of the default
 * value types has an effect on how the prompt looks like.
 *
 * - `undefined` will suffix the prompt with `[y/n]`
 * - `true` will suffix the prompt with `[Y/n]`
 * - `false` will suffix the prompt with `[y/N]`
 *
 * The only valid values are anything starting with y or n uppercase or lowercase. The y and
 * n is derived from the positive and negative labels. You can customize the labels in the
 * options object The prompt can be canceled and will then return `undefined`.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
 * - `Down` arrow or `End` key will move the cursor to the end of the prompt text.
 * - `Left` arrow will move the cursor one step to the left once if able.
 * - `Right` arrow will move the cursor one step to the right once if able.
 * - `Enter` will return the parsed result of the text.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param type The confirm type.
 * @param label The label the question will have.
 * @param defaultValue The value that will determine the resulting value if none was provided.
 * @returns The boolean value from the answer or `undefined` if canceled.
 */
export default function question(type: 'confirm', label: string, defaultValue?: boolean | ConfirmOptions | undefined): Promise<boolean | undefined>;
/**
 * Create a generic text input question requesting the user to input text in a free form format.
 * A default value can be provided and if the free form text input is blank that value will be
 * used instead.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
 * - `Down` arrow or `End` key will move the cursor to the end of the prompt text.
 * - `Left` arrow will move the cursor one step to the left once if able.
 * - `Right` arrow will move the cursor one step to the right once if able.
 * - `Enter` will return the test inputted or the provided default value.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param type The input type.
 * @param label The label the question will have.
 * @param defaultValue The value that will determine the resulting value if none was provided.
 * @returns The answer text, default value text, or `undefined` if canceled.
 */
export default function question(type: 'input', label: string, defaultValue?: string | undefined): Promise<string | undefined>;
/**
 * Creates a free form text input that does not print the characters normally printed by the `input`
 * prompt. The characters are substituted for a substitute string you can provide. If the substitute
 * parameter is a boolean false no substitute characters will be printed.
 *
 * The substitute string if longer than 1 character can be called a pattern and will also be printed
 * in that pattern. So if you have a pattern of `<>` and that length of the text i 5 the substitution
 * will look like `<><><`.
 *
 * Controls:
 * - `Ctrl+c` will have the question canceled and return `undefined`.
 * - `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
 * - `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
 * - `Down` arrow or `End` key will move the cursor to the end of the prompt text.
 * - `Left` arrow will move the cursor one step to the left once if able.
 * - `Right` arrow will move the cursor one step to the right once if able.
 * - `Enter` will return the test inputted or the provided default value.
 *
 * Requires `--unstable` until the `Deno.setRaw` API is finalized.
 * @param type The password type.
 * @param label The label the question will have.
 * @param substitute The substitution string or boolean indicating if you want a substitution string.
 * @returns The answer text or `undefined` if canceled.
 */
export default function question(type: 'password', label: string, substitute?: boolean | string | undefined): Promise<string | undefined>;
export default function question(type: string, ...opts: any[]): Promise<any | undefined> {
  switch (type) {
    case 'list': return list(...(opts as Parameters<typeof list>))
    case 'confirm': return confirm(...(opts as Parameters<typeof confirm>))
    case 'checkbox': return checkbox(...(opts as Parameters<typeof checkbox>))
    case 'input': return input(...(opts as Parameters<typeof input>))
    case 'password': return password(...(opts as Parameters<typeof password>))
    default: throw new Error(`Unsupported type: ${type}`)
  }
}
