import type { Validation, ValidationMode } from '../curriculum/types'
import { EditableBlock, EditableTextarea } from './EditableField'
import { useEditor } from './EditorContext'

const MODES: ValidationMode[] = ['equalsNormalized', 'includesAll', 'regex', 'python_tests']

interface EditableValidationEditorProps {
  validation: Validation
  onChange: (validation: Validation) => void
}

export function EditableValidationEditor({ validation, onChange }: EditableValidationEditorProps) {
  const { canEdit, isEditMode } = useEditor()
  if (!canEdit || !isEditMode) return null

  const setMode = (mode: ValidationMode) => {
    onChange({ ...validation, mode })
  }

  return (
    <EditableBlock label="Validation">
      <label className="cq-editable-field">
        <span className="cq-label">Mode</span>
        <select
          className="cq-editable-select"
          value={validation.mode}
          onChange={(e) => setMode(e.target.value as ValidationMode)}
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {validation.mode === 'equalsNormalized' && (
        <EditableTextarea
          label="Expected answer"
          rows={1}
          value={validation.expected ?? ''}
          onChange={(expected) => onChange({ ...validation, expected })}
        />
      )}

      {validation.mode === 'regex' && (
        <EditableTextarea
          label="Regex pattern"
          rows={1}
          value={validation.pattern ?? ''}
          onChange={(pattern) => onChange({ ...validation, pattern })}
        />
      )}

      {validation.mode === 'includesAll' && (
        <EditableTextarea
          label="Needles (one per line)"
          rows={3}
          value={(validation.needles ?? []).join('\n')}
          onChange={(raw) =>
            onChange({
              ...validation,
              needles: raw.split('\n').filter((n) => n.length > 0),
            })
          }
        />
      )}

      {validation.mode === 'python_tests' && (
        <>
          <EditableTextarea
            label="Setup code"
            rows={3}
            value={validation.setupCode ?? ''}
            onChange={(setupCode) => onChange({ ...validation, setupCode })}
          />
          {(validation.tests ?? []).map((t, i) => (
            <div key={t.id} className="cq-editable-nested">
              <EditableTextarea
                label={`Test ${i + 1} label`}
                rows={1}
                value={t.label}
                onChange={(label) => {
                  const tests = [...(validation.tests ?? [])]
                  tests[i] = { ...tests[i], label }
                  onChange({ ...validation, tests })
                }}
              />
              <EditableTextarea
                label={`Test ${i + 1} assertion`}
                rows={2}
                value={t.assertion}
                onChange={(assertion) => {
                  const tests = [...(validation.tests ?? [])]
                  tests[i] = { ...tests[i], assertion }
                  onChange({ ...validation, tests })
                }}
              />
            </div>
          ))}
        </>
      )}
    </EditableBlock>
  )
}
