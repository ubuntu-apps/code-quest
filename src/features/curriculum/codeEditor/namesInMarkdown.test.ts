import { describe, expect, it } from 'vitest'
import { namesInMarkdown } from './namesInMarkdown'

describe('namesInMarkdown', () => {
  it('takes names written as code', () => {
    expect(namesInMarkdown('Set `day_off` to whether `is_weekend` or `is_holiday` is `True`.')).toEqual([
      'day_off',
      'is_weekend',
      'is_holiday',
      'True',
    ])
  })

  it('takes function names and the name an assignment sets', () => {
    expect(namesInMarkdown('Call `greet()` after `total = 0`, not `total == 0`.')).toEqual(['greet', 'total'])
  })

  it('leaves out example output, one-letter names and fenced code', () => {
    expect(namesInMarkdown('Print `Hello, world!` and `x`.\n\n```\nhidden = 1\n```\nThen `shown`.')).toEqual(['shown'])
  })

  it('lists each name once', () => {
    expect(namesInMarkdown('`score` and `score` again')).toEqual(['score'])
  })
})
