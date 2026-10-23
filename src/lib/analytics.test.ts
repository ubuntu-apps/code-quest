import { describe, expect, it } from 'vitest'
import { screenPath } from './analytics'

describe('screenPath', () => {
  it('drops trailing slashes and keeps the root as /', () => {
    expect(screenPath('/learn/python/')).toBe('/learn/python')
    expect(screenPath('/')).toBe('/')
    expect(screenPath('')).toBe('/')
  })
})
