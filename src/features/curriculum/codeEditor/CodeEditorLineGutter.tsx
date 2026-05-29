type Props =
  | {
      lineCount: number
      errorLine: number
      mode: 'highlight'
    }
  | {
      lineCount: number
      mode: 'phantom'
    }

export function CodeEditorLineGutter(props: Props) {
  const { lineCount, mode } = props
  return (
    <>
      {Array.from({ length: lineCount }, (_, i) => {
        if (mode === 'phantom') {
          return (
            <div key={i} className="cq-code-editor-line cq-code-editor-line--phantom" aria-hidden />
          )
        }
        const n = i + 1
        const isErr = n === props.errorLine
        return <div key={i} className={`cq-code-editor-line${isErr ? ' cq-code-editor-line--error' : ''}`} />
      })}
    </>
  )
}
