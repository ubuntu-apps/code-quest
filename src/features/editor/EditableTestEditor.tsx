import type { TestQuestion } from '../curriculum/types'
import { EditableBlock, EditableMarkdown, EditableText, EditableTextarea } from './EditableField'
import { useEditorMode } from './editorHooks'
import { EditableValidationEditor } from './EditableValidationEditor'

interface EditableTestQuestionProps {
  question: TestQuestion
  onChange: (question: TestQuestion) => void
}

export function EditableTestQuestionEditor({ question, onChange }: EditableTestQuestionProps) {
  const { canEdit, isEditMode } = useEditorMode()
  if (!canEdit || !isEditMode) return null

  if (question.type === 'mcq') {
    return (
      <EditableBlock label="Edit MCQ question">
        <EditableTextarea
          label="Prompt"
          rows={2}
          value={question.prompt}
          onChange={(prompt) => onChange({ ...question, prompt })}
        />
        {question.choices.map((choice, i) => (
          <div key={choice.id} className="cq-editable-nested">
            <EditableText
              value={choice.label}
              onChange={(label) => {
                const choices = [...question.choices]
                choices[i] = { ...choices[i], label }
                onChange({ ...question, choices })
              }}
              placeholder={`Choice ${choice.id}`}
            />
          </div>
        ))}
        <label className="cq-editable-field">
          <span className="cq-label">Correct choice</span>
          <select
            className="cq-editable-select"
            value={question.correctChoiceId}
            onChange={(e) => onChange({ ...question, correctChoiceId: e.target.value })}
          >
            {question.choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}: {c.label.slice(0, 40)}
              </option>
            ))}
          </select>
        </label>
      </EditableBlock>
    )
  }

  return (
    <EditableBlock label="Edit short-text question">
      <EditableMarkdown
        label="Prompt"
        value={question.prompt}
        onChange={(prompt) => onChange({ ...question, prompt })}
      />
      <EditableValidationEditor
        validation={question.validation}
        onChange={(validation) => onChange({ ...question, validation })}
      />
    </EditableBlock>
  )
}
