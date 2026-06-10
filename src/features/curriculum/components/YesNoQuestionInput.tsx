import { yesNoDisplayPrompt } from '../testQuestionUtils'

interface YesNoQuestionInputProps {
  prompt: string
  value: string | undefined
  correctAnswer: 'yes' | 'no'
  showFeedback: boolean
  questionPassed: boolean | undefined
  onChange: (value: 'yes' | 'no') => void
}

export function YesNoQuestionInput({
  prompt,
  value,
  correctAnswer,
  showFeedback,
  questionPassed,
  onChange,
}: YesNoQuestionInputProps) {
  const selected = value === 'yes' || value === 'no' ? value : null

  const optionClass = (choice: 'yes' | 'no') => {
    let cls = 'cq-yesno-opt'
    const isSelected = selected === choice
    const isCorrect = correctAnswer === choice

    if (isSelected) cls += ' cq-yesno-opt--selected'

    if (showFeedback) {
      if (isCorrect) cls += ' cq-yesno-opt--correct'
      else if (isSelected) cls += ' cq-yesno-opt--wrong'
    } else if (isSelected) {
      cls += ' cq-yesno-opt--active'
    }

    return cls
  }

  return (
    <div className="cq-yesno">
      <p className="cq-yesno-prompt">{yesNoDisplayPrompt(prompt)}</p>
      <div className="cq-yesno-options" role="group" aria-label="Yes or no">
        {(['yes', 'no'] as const).map((choice) => (
          <label key={choice} className={optionClass(choice)}>
            <input
              type="checkbox"
              className="cq-yesno-checkbox"
              checked={selected === choice}
              onChange={() => onChange(choice)}
              aria-checked={selected === choice}
            />
            <span className="cq-yesno-box" aria-hidden="true" />
            <span className="cq-yesno-label">{choice === 'yes' ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
      {showFeedback && questionPassed === false && selected === null && (
        <p className="cq-yesno-hint">Select Yes or No.</p>
      )}
    </div>
  )
}
