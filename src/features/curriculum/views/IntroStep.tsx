import type { Level } from '../content/types'
import { SimpleMarkdown } from '../SimpleMarkdown'
import { CodeSandboxSection } from '../components/CodeSandboxSection'
import { languagePack } from '../../languages'
import type { SandboxState } from '../hooks/useSandbox'

interface IntroStepProps {
  level: Level
  languageId: string
  /** The lesson's sandbox (useSandbox). */
  sandbox: SandboxState
  onReadMoreOpen: () => void
}

export function IntroStep({
  level,
  languageId,
  sandbox,
  onReadMoreOpen,
}: IntroStepProps) {
  // Courses whose code runs here get "Try it" buttons and the sandbox.
  const hasCode = languagePack(languageId) !== null

  /** "Try it" on a lesson's code block: load it into the sandbox below and scroll there. */
  const tryCode = (code: string) => {
    sandbox.setCode(code)
    sandbox.clearError()
    document.getElementById('cq-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="cq-panel">
      {/* The level's name is already the page heading, so an intro title that repeats it is skipped. */}
      {level.intro.title && level.intro.title !== level.title && <h2 className="cq-subtitle">{level.intro.title}</h2>}
      <SimpleMarkdown text={level.intro.bodyMarkdown} onTryCode={hasCode ? tryCode : undefined} />
      {level.intro.readMore && (
        <div className="cq-row">
          <button type="button" className="cq-btn cq-btn--primary" onClick={onReadMoreOpen}>
            {level.intro.readMore.label ?? 'Read more'}
          </button>
        </div>
      )}
      {hasCode && (
        <CodeSandboxSection
          languageId={languageId}
          tables={level.database?.tables}
          setupSql={level.database?.setupSql}
          snippets={level.sandboxSnippets}
          code={sandbox.code}
          onCodeChange={sandbox.setCode}
          output={sandbox.output}
          running={sandbox.running}
          error={sandbox.error}
          errorUiEpoch={sandbox.errorUiEpoch}
          onRun={(stdin) => void sandbox.run(stdin)}
          onStop={sandbox.stop}
          onReset={() => sandbox.reset(level)}
          onErrorClear={sandbox.clearError}
        />
      )}
    </section>
  )
}
