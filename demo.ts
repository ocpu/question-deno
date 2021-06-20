import question from './mod.ts'

await question('confirm', 'Confirm?', true)
await question('list', 'List?', ['hello', 'world'])
await question('checkbox', 'Checkboxes?', ['hello', 'world'])
await question('input', 'Input?')
await question('input', 'Input with default?', 'default')
console.log('Result: %s', await question('password', 'Password? (will print result)'))
console.log('Result: %s', await question('password', 'Password with custom pattern? (will print result)', '<>'))
console.log('Result: %s', await question('password', 'Password with no printing characters? (will print result)', false))
console.log('Result: %s', await question('list', 'List with object? (will print result)', {
  'Cheese': 'cheese',
  'Milk': 'milk',
  'Tofu': 'tofu',
}))
console.log('Result: %s', await question('checkbox', 'Select stuff with object? (will print result)', {
  'Cheese': { value: 'cheese', selected: true },
  'Garlic': { value: 'garlic' },
  'Salami': { value: 'salami' },
}))
