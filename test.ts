import question from './mod.ts'

await question('confirm', 'Confirm?', true)
await question('list', 'List?', ['hello', 'world'])
await question('checkbox', 'Checkboxes?', ['hello', 'world'])
await question('input', 'Input?')
await question('input', 'Input with default?', 'default')
console.log('Result: %s', await question('password', 'Password? (will print)'))
console.log('Result: %s', await question('password', 'Password? (will print)', '<>'))
console.log('Result: %s', await question('password', 'Password? (will print)', false))
console.log('Result: %s', await question('list', 'List with object? (will print)', {
  'Cheese': 'cheese',
  'Milk': 'milk',
  'Tofu': 'tofu',
}))
