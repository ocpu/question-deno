import question from './mod.ts'

await question('confirm', 'Confirm?', true)
await question('list', 'List?', ['hello', 'world'])
await question('checkbox', 'Checkboxes?', ['hello', 'world'])
await question('input', 'Input?')
await question('input', 'Input with default?', 'default')
