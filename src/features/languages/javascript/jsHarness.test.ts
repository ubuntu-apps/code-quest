import { describe, expect, it } from 'vitest'
import { formatLog, inspect, runJavaScript, syntaxErrorLine } from './jsHarness'

const test = (id: string, assertion: string) => ({ id, label: id, assertion })

describe('runJavaScript', () => {
  it('shows what the code logs, one line per console.log', async () => {
    const result = await runJavaScript('console.log("Hello")\nconsole.log(2 + 3, "apples")')
    expect(result).toEqual({ output: 'Hello\n5 apples', error: null })
  })

  it('points at the line of an error, counting only the learner’s code', async () => {
    const result = await runJavaScript('console.log("a")\nConsole.log("b")', { setupCode: 'const x = 1\nconst y = 2' })
    expect(result.output).toBe('a')
    expect(result.error).toMatchObject({ name: 'ReferenceError', message: 'Console is not defined', line: 2 })
  })

  it('finds the line of a syntax error', async () => {
    const result = await runJavaScript('console.log("ok")\nconsole.log("no closing quote)\nconsole.log(3)')
    expect(result.error).toMatchObject({ name: 'SyntaxError', line: 2 })
    expect(syntaxErrorLine('let a = 1\nlet b = (\nlet c = 3')).toBe(2)
  })

  it('lets the code await, and waits for its timers', async () => {
    const result = await runJavaScript('await new Promise((r) => setTimeout(r, 5))\nconsole.log("after")\nsetTimeout(() => console.log("later"), 5)')
    expect(result.output).toBe('after\nlater')
  })

  it('runs the tests after the code, seeing its variables, its code and its output', async () => {
    const result = await runJavaScript('const hours = 365 * 24\nconsole.log(hours)', {
      tests: [test('a', 'hours === 8760'), test('b', '_cq_code.includes("*")'), test('c', '_cq_prints("8760")'), test('d', '_cq_output === "8760"')],
    })
    expect(result.tests?.every((t) => t.passed)).toBe(true)
  })

  it('shows the difference when the output is wrong, and the error when a test throws', async () => {
    const result = await runJavaScript('console.log(876)', { tests: [test('a', '_cq_prints("8760")'), test('b', 'missing === 1')] })
    expect(result.tests?.[0]).toMatchObject({ passed: false, diff: { expected: '8760', actual: '876', text: true } })
    expect(result.tests?.[1]).toMatchObject({ passed: false, detail: 'ReferenceError: missing is not defined' })
  })

  it('fails every test when the code has an error', async () => {
    const result = await runJavaScript('Console.log(1)', { tests: [test('a', 'true')] })
    expect(result.error?.name).toBe('ReferenceError')
    expect(result.tests?.[0]?.passed).toBe(false)
  })

  it('reports an error thrown inside a timer', async () => {
    const result = await runJavaScript('setTimeout(() => nope(), 1)')
    expect(result.error).toMatchObject({ name: 'ReferenceError', line: 1 })
  })
})

describe('inspect', () => {
  it('shows values as Node’s console.log does', () => {
    expect(formatLog(['text', 1, [1, 'a'], { a: 1, 'b c': true }])).toBe("text 1 [ 1, 'a' ] { a: 1, 'b c': true }")
    expect(inspect("it's")).toBe('"it\'s"')
    expect(inspect([])).toBe('[]')
    expect(inspect({})).toBe('{}')
    expect(inspect(new Map([['a', 1]]))).toBe("Map(1) { 'a' => 1 }")
    expect(inspect(new Set([1, 2]))).toBe('Set(2) { 1, 2 }')
    expect(inspect(-0)).toBe('-0')
    expect(inspect(null)).toBe('null')
    expect(inspect(undefined)).toBe('undefined')
    expect(inspect(function named() {})).toBe('[Function: named]')
    expect(inspect(class Box {})).toBe('[class Box]')
    expect(inspect([[[[1]]]])).toBe('[ [ [ [Array] ] ] ]')
  })
})

describe('_cq_rerun', () => {
  const starter = 'const price = 4.5\nconst quantity = 3'
  const alt = 'const price = 5.6\nconst quantity = 4'
  const solution = `${starter}\nconst subtotal = price * quantity`
  const rerunTest = (vars: string[]) => test('other', `_cq_rerun(${JSON.stringify(starter)}, ${JSON.stringify(alt)}, ${JSON.stringify(solution)}, ${JSON.stringify(vars)})`)

  it('passes an answer that works it out, and fails one typed in', async () => {
    const worked = await runJavaScript(`${starter}\nconst subtotal = quantity * price`, { tests: [rerunTest(['subtotal'])] })
    expect(worked.tests?.[0]?.passed).toBe(true)
    const typed = await runJavaScript(`${starter}\nconst subtotal = 13.5`, { tests: [rerunTest(['subtotal'])] })
    expect(typed.tests?.[0]?.passed).toBe(false)
  })

  it('compares the output too when asked', async () => {
    const t = test('o', `_cq_rerun("const n = 2", "const n = 5", "const n = 2\\nconsole.log(n * 2)", [], true)`)
    expect((await runJavaScript('const n = 2\nconsole.log(n + n)', { tests: [t] })).tests?.[0]?.passed).toBe(true)
    expect((await runJavaScript('const n = 2\nconsole.log(4)', { tests: [t] })).tests?.[0]?.passed).toBe(false)
  })
})
