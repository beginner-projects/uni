import { namehash } from '@ethersproject/hash'

export function safeNamehash(name?: string): string | undefined {
  if (typeof name === 'undefined') return undefined

  try {
    return namehash(name)
  } catch (error) {
    console.debug(error)
    return undefined
  }
}
