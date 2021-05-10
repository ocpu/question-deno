# Question

This is a module that can handle CLI questions/inquiries that can be resolved in a CLI. This module requires the use of `--unstable` flag since the raw reader API is not finalized yet. Test the different question types: `deno run --unstable https://raw.githubusercontent.com/ocpu/question-deno/master/test.ts`

```typescript
import question from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

const result = await question('confirm', 'Confirm removal of X?', true)
if (result === undefined) console.log('Prompt was canceled')
else if (result) console.log('I will now remove X')
else console.log('X will not be removed')
```

Each input type is documented in the overload list for the question function, it describes the use, the parameters, and controls.

## Question Types
Current question types:
- `input`: Ask the user for a free form text answer.
- `confirm`: Ask for a confirmation about an action.
- `list`: Provide a list from which the user can chose one option.
- `checkbox`: Provide a list of options from which the user can mark the options they want.

### Input

Create a generic text input question requesting the user to input text in a free form format.
A default value can be provided and if the free form text input is blank that value will be
used instead.

Controls:
- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
- `Down` arrow or `End` key will move the cursor to the end of the prompt text.
- `Left` arrow will move the cursor one step to the left once if able.
- `Right` arrow will move the cursor one step to the right once if able.
- `Enter` will return the test inputted or the provided default value.

### Confirm

Create a confirmation question that resolves to a true or false based on user input. It
takes an `undefined`, `true`, or `false` value as the default value. Each of the default
value types has an effect on how the prompt looks like.

- `undefined` will suffix the prompt with `[y/n]`
- `true` will suffix the prompt with `[Y/n]`
- `false` will suffix the prompt with `[y/N]`

The only valid values are anything starting with y or n uppercase or lowercase. The y and
n is derived from the positive and negative labels. You can customize the labels in the
options object The prompt can be canceled and will then return `undefined`.

Controls:
- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
- `Down` arrow or `End` key will move the cursor to the end of the prompt text.
- `Left` arrow will move the cursor one step to the left once if able.
- `Right` arrow will move the cursor one step to the right once if able.
- `Enter` will return the parsed result of the text.

### List

Creates a list of selectable items from which one item can be chosen. If no items are available
to be selected this will return `undefined` without a question prompt.

Controls:
- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Up` arrow will move the selected item up once if able.
- `Down` arrow will move the selected item down once if able.
- `Enter` will return the currently selected item.

### Checkbox

Creates a list of selectable items from which one item will be chosen. If no items are available
to be selected this will return `undefined` without a question prompt.

Controls:
- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Up` arrow will move the selected item up once if able.
- `Down` arrow will move the selected item down once if able.
- `Space` will mark/unmark the selected item.
- `Enter` will return all marked items in a list.
