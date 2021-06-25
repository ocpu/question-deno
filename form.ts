import confirm, { ConfirmOptions, createPromptText as createPromptTextConfirm } from './confirm.ts'
import input, { createPromptText as createPromptTextInput } from './input.ts'
import password, { createPromptText as createPromptTextPassword } from './password.ts'
import { moveCursor, print, println } from './util.ts'

export type Spec =
  | [type: 'confirm', label: string, defaultValue?: boolean | ConfirmOptions | undefined]
  | [type: 'input', label: string, defaultValue?: string | undefined]
  | [type: 'password', label: string, substitute?: boolean | string | undefined]
export type SpecRes<S extends Spec> =
  S[0] extends 'confirm' ? boolean :
  S[0] extends 'input' ? string :
  S[0] extends 'password' ? string :
  never

export default async function form<T extends { [name: string]: Spec }>(elements: T): Promise<{ [K in keyof T]: SpecRes<T[K]> } | undefined> {
  const promptLines = Object.values(elements).map(([type, ...params]) => {
    switch (type) {
      case 'confirm': return createPromptTextConfirm(...(params as unknown as Parameters<typeof createPromptTextConfirm>))
      case 'input': return createPromptTextInput(...(params as unknown as Parameters<typeof createPromptTextInput>))
      case 'password': return createPromptTextPassword(...(params as unknown as Parameters<typeof createPromptTextPassword>))
      default: throw new Error(`The type ${type} is not a valid type`)
    }
  })
  const results: Record<string, any> = {}
  for (let entryIndex = 0, entries = Object.entries(elements); entryIndex < entries.length; entryIndex++) {
    const [name, [type, ...params]] = entries[entryIndex]
    for (let promptIndex = entryIndex; promptIndex < promptLines.length; promptIndex++) {
      const line = promptLines[promptIndex]
      if (promptIndex + 1 < entries.length) await println(line)
      else await print(line)
    }
    await print(
      moveCursor(500, 'left') +
      moveCursor(entries.length - entryIndex - 1, 'up')
    )
    let result
    switch (type) {
      case 'confirm':
        result = await confirm(...(params as unknown as Parameters<typeof confirm>))
        break
      case 'input': 
        result = await input(...(params as unknown as Parameters<typeof input>))
        break
      case 'password': 
        result = await password(...(params as unknown as Parameters<typeof password>))
        break
      default: throw new Error(`The type ${type} is not a valid type`)
    }
    if (result === undefined) {
      if (entryIndex + 1 < entries.length) {
        await println(moveCursor(entries.length - entryIndex - 1, 'down'))
      }
      return undefined
    }
    results[name] = result
  }
  return results as { [K in keyof T]: SpecRes<T[K]> }
}

const res = await form({
  username: ['input', 'Username:', 'admin'],
  password: ['password', 'Password:'],
  remember: ['confirm', 'Remember Password?', false]
})

console.log(res)
