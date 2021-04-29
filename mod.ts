import confirm from './confirm.ts'
import checkbox from './checkbox.ts'
import list from './list.ts'
import input from './input.ts'

/**
 * Creates a selectable list from which one item will be chosen. If no items are available
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
export default function question(type: 'list', label: string, options: string[]): Promise<string | undefined>;
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
export default function question(type: 'checkbox', label: string, options: string[]): Promise<string[] | undefined>;
/**
 * Create a confirmation question that resolves to a true or false based on user input. It
 * takes an `undefined`, `true`, or `false` value as the default value. Each of the default
 * value types has an effect on how the prompt looks like.
 *
 * - `undefined` will suffix the prompt with `[y/n]`
 * - `true` will suffix the prompt with `[Y/n]`
 * - `false` will suffix the prompt with `[y/N]`
 *
 * The only valid values are anything starting with y or n uppercase or lowercase. The prompt
 * can be canceled and will then return `undefined`.
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
export default function question(type: 'confirm', label: string, defaultValue?: boolean | undefined): Promise<boolean | undefined>;
/**
 * Create a generic text input question requesting the user to input text in a free form format.
 * A default value can be provided and if the free form text input is blank the value will be
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
 * @param type The confirm type.
 * @param label The label the question will have.
 * @param defaultValue The value that will determine the resulting value if none was provided.
 * @returns The answer text, default value text, or `undefined` if canceled.
 */
export default function question(type: 'input', label: string, defaultValue?: string | undefined): Promise<string | undefined>;
export default function question(type: string, ...opts: any[]): Promise<any | undefined> {
  switch (type) {
    case 'list': return list(...(opts as Parameters<typeof list>))
    case 'confirm': return confirm(...(opts as Parameters<typeof confirm>))
    case 'checkbox': return checkbox(...(opts as Parameters<typeof checkbox>))
    case 'input': return input(...(opts as Parameters<typeof input>))
    default: throw new Error(`Unsupported type: ${type}`)
  }
}
