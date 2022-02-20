# Question

This is a module that can handle CLI questions/inquiries that can be resolved in a CLI. This module requires the use of `--unstable` flag since the raw reader API is not finalized yet.

```typescript
import question from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

const result = await question('confirm', 'Confirm removal of X?', true)
if (result === undefined) console.log('Prompt was canceled')
else if (result) console.log('I will now remove X')
else console.log('X will not be removed')
```

Each input type is documented in the overload list for the question function, it describes the use, the parameters, and controls.

Test the different question types: `deno run --unstable https://raw.githubusercontent.com/ocpu/question-deno/master/demo.ts`

<details>
<summary>TOC</summary>

- [Question](#question)
  - [Question Types](#question-types)
    - [Input](#input)
    - [Confirm](#confirm)
    - [List](#list)
    - [Checkbox](#checkbox)
    - [Password](#password)
  - [Config](#config)
    - [Config option `keypressReader`](#config-option-keypressreader)
    - [Config option `writer`](#config-option-writer)

</details>

## Question Types

Current question types:

- [`input`](#input): Ask the user for a free form text answer.
- [`confirm`](#confirm): Ask for a confirmation about an action.
- [`list`](#list): Provide a list from which the user can chose one option.
- [`checkbox`](#checkbox): Provide a list of options from which the user can mark the options they want.
- [`password`](#password): Provide a free form password input with substitution text.

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
- `Home` will move the selected item up to the start if able.
- `End` will move the selected item down to the end if able.
- `PageUp` will move the selected item up by the actual list window size if able.
- `PageDown` will move the selected item down by the actual list window size if able.
- `Enter` will return the currently selected item.

The options can either be a list of strings or an object describing the different options.

This control supports filtering by the label set by the option. To get started with the default configuration set the `filtering` list option to true. It will try to match the characters input with the label values.

The filtering has support to be able to search by exact label value, highlight the sections on the label that is matching the string, only sort the options by the string instead to removing the non matching options, and sort the options by specificity rank or the specified manual sorting.

```typescript
import question from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

await question('list', 'Select groceries?', ['Cheese', 'Milk', 'Tofu'])
await question('list', 'Select groceries?', {
  // <Label>: <value> - value can be anything
  'Cheese': 'cheese',
  'Milk': 'milk',
  'Tofu': 'tofu',
})
```

### Checkbox

Creates a list of selectable items from which one item will be chosen. If no items are available
to be selected this will return `undefined` without a question prompt.

Controls:


- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Ctrl+a` will select/deselect all options.
- `Up` arrow will move the selected item up once if able.
- `Down` arrow will move the selected item down once if able.
- `Home` will move the selected item up to the start if able.
- `End` will move the selected item down to the end if able.
- `PageUp` will move the selected item up by the actual list window size if able.
- `PageDown` will move the selected item down by the actual list window size if able.
- `Space` will mark/unmark the selected item.
- `Enter` will return all marked items in a list.

The options can either be a list of strings or an object describing the different options.

If the options parameter is a plain object where the key is the label and the value is a
object definition how the option is represented in the list and with a value. The representation
keys are:

- `dependencies`: This is a value that takes a index, label, or a list of indices and labels to
  express the reliance of a different option. So whenever any dependant option is select this one is too. Same for deselects.
- `selected`: This makes the option selected by default. If the option depends on any other options
  They will also be selected.

This control supports filtering by the label set by the option. To get started with the default configuration set the `filtering` checkbox option to true. It will try to match the characters input with the label values.

The filtering has support to be able to search by exact label value, highlight the sections on the label that is matching the string, only sort the options by the string instead to removing the non matching options, and sort the options by specificity rank or the specified manual sorting.

```typescript
import question from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

await question('checkbox', 'Select toppings?', ['Cheese', 'Garlic', 'Salami'])
await question('checkbox', 'Select toppings?', {
  // <Label>: <Options> - value can be anything
  'Cheese': { value: 'cheese', selected: true },
  'Garlic': { value: 'garlic' },
  'Salami': { value: 'salami' },
})
```

### Password

Creates a free form text input that does not print the characters normally printed by the `input`
prompt. The characters are substituted for a substitute string you can provide. If the substitute
parameter is a boolean false no substitute characters will be printed.

The substitute string if longer than 1 character can be called a pattern and will also be printed
in that pattern. So if you have a pattern of `<>` and that length of the text i 5 the substitution
will look like `<><><`.

Controls:

- `Ctrl+c` will have the question canceled and return `undefined`.
- `Ctrl+d` will exit the whole script no questions asked with a `Deno.exit()`.
- `Up` arrow or `Home` key will move the cursor to the start of the prompt text.
- `Down` arrow or `End` key will move the cursor to the end of the prompt text.
- `Left` arrow will move the cursor one step to the left once if able.
- `Right` arrow will move the cursor one step to the right once if able.
- `Enter` will return the test inputted or the provided default value.

## Config

The project currently supports these configuration options:
- [`keypressReader`](#config-option-keypressreader): A way of specifying from where the input characters will be read from. Default is `Deno.stdin`.
- [`writer`](#config-option-writer): A way of specifying from where to output the option rendering. Default is `Deno.stdout`.

These options mostly come in handy when you want use the program you are writing as a start, end, and/or in between step of linux pipes.

### Config option `keypressReader`

You can config keypress reader to prevent ["Keypress can be read only under TTY" error if you try to use piped input](https://github.com/ocpu/question-deno/issues/1) on Linux:

```typescript
import question, { questionConfig as questionConfig } from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

try {
  // requires --allow-read on the file specified.
  const tty = await Deno.open("/dev/tty");
  if (Deno.isatty(tty.rid)) {
    questionConfig.keypressReader = tty;
  }
} catch(e) {}
```

### Config option `writer`

This config option lets you direct the output flow of the prompts supported by the library. It is most useful when you want your program to output something for a different program in a pipe chain.

```typescript
import question, { questionConfig as questionConfig } from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

try {
  // requires --allow-write on the file specified.
  const tty = await Deno.open("/dev/tty", { write: true });
  if (Deno.isatty(tty.rid)) {
    questionConfig.writer = tty;
  }
} catch(e) {}

```
