# Question

This is a module that can handle CLI questions/inquiries that can be resolved in a CLI. This module requires the use of `--unstable` flag since the raw reader API is not finalized yet.

```typescript
import question from 'https://raw.githubusercontent.com/ocpu/question-deno/master/mod.ts'

const result = await question('confirm', 'Confirm removal of X?', true)
if (result === undefined) console.log('Prompt was canceled')
else if (result) console.log('I will now remove X')
else console.log('X will not be removed')
```

Current question types:
- `input`: Ask the user for a free form text answer.
- `confirm`: Ask for a confirmation about an action.
- `list`: Provide a list from which the user can chose one option.
- `checkbox`: Provide a list of options from which the user can mark the options they want.
