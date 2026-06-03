import type { Level } from '../types'
import {
  EditableBlock,
  EditableMarkdown,
  EditableText,
  EditableTextarea,
  useEditorMode,
} from '../../editor'
import { PythonSandboxSection } from '../components/PythonSandboxSection'
import type { FriendlyPythonError } from '../pythonSandbox'

interface IntroStepProps {
  level: Level
  languageId: string
  sandboxCode: string
  sandboxOutput: string
  sandboxRunning: boolean
  sandboxError: FriendlyPythonError | null
  sandboxErrorUiEpoch: number
  onUpdateIntro: (patch: Partial<Level['intro']>) => void
  onReadMoreOpen: () => void
  onSandboxCodeChange: (code: string) => void
  onSandboxRun: () => void
  onSandboxReset: () => void
  onSandboxErrorClear: () => void
}

export function IntroStep({
  level,
  languageId,
  sandboxCode,
  sandboxOutput,
  sandboxRunning,
  sandboxError,
  sandboxErrorUiEpoch,
  onUpdateIntro,
  onReadMoreOpen,
  onSandboxCodeChange,
  onSandboxRun,
  onSandboxReset,
  onSandboxErrorClear,
}: IntroStepProps) {
  const { isEditingLocal } = useEditorMode()

  return (
    <section className="cq-panel">
      {(level.intro.title || isEditingLocal) && (
        <EditableText
          as="h2"
          className="cq-subtitle"
          value={level.intro.title ?? ''}
          placeholder="Intro title"
          onChange={(title) => onUpdateIntro({ title })}
        />
      )}
      <EditableMarkdown
        value={level.intro.bodyMarkdown}
        onChange={(bodyMarkdown) => onUpdateIntro({ bodyMarkdown })}
      />
      {(level.intro.readMore || isEditingLocal) && (
        <div className="cq-row">
          {level.intro.readMore && !isEditingLocal ? (
            <button type="button" className="cq-btn cq-btn--primary" onClick={onReadMoreOpen}>
              {level.intro.readMore.label ?? 'Read more'}
            </button>
          ) : (
            isEditingLocal && (
              <button
                type="button"
                className="cq-btn cq-btn--primary"
                onClick={onReadMoreOpen}
                disabled={!level.intro.readMore}
              >
                Preview read more
              </button>
            )
          )}
        </div>
      )}
      {isEditingLocal && (
        <EditableBlock label="Read more link">
          <EditableText
            value={level.intro.readMore?.label ?? ''}
            placeholder="Button label"
            onChange={(label) =>
              onUpdateIntro({
                readMore: {
                  label,
                  url: level.intro.readMore?.url ?? '',
                  source: level.intro.readMore?.source ?? '',
                },
              })
            }
          />
          <EditableTextarea
            label="URL"
            rows={1}
            value={level.intro.readMore?.url ?? ''}
            onChange={(url) =>
              onUpdateIntro({
                readMore: {
                  label: level.intro.readMore?.label,
                  url,
                  source: level.intro.readMore?.source ?? '',
                },
              })
            }
          />
          <EditableTextarea
            label="Source credit"
            rows={1}
            value={level.intro.readMore?.source ?? ''}
            onChange={(source) =>
              onUpdateIntro({
                readMore: {
                  label: level.intro.readMore?.label,
                  url: level.intro.readMore?.url ?? '',
                  source,
                },
              })
            }
          />
        </EditableBlock>
      )}
      {languageId === 'python' && (
        <PythonSandboxSection
          code={sandboxCode}
          onCodeChange={onSandboxCodeChange}
          output={sandboxOutput}
          running={sandboxRunning}
          error={sandboxError}
          errorUiEpoch={sandboxErrorUiEpoch}
          onRun={onSandboxRun}
          onReset={onSandboxReset}
          onErrorClear={onSandboxErrorClear}
        />
      )}
    </section>
  )
}
