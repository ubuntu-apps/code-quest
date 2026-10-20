import { playSound, setSoundOn, useSoundOn } from './sound'

/** About tab: confirmation sounds on or off. */
export function SoundPanel() {
  const on = useSoundOn()
  const choose = (value: boolean) => {
    setSoundOn(value)
    // A sample, so turning sounds on confirms they work (this tap allows audio).
    if (value) playSound('checkPass')
  }
  return (
    <section className="cq-panel cq-sound-panel">
      <h2 className="cq-subtitle" id="cq-sound-title">
        Sounds
      </h2>
      <p className="cq-muted cq-sound-lead">
        Short sounds when a check passes or fails, a quiz is done, or you earn a badge.
      </p>
      <div className="cq-segmented" role="radiogroup" aria-labelledby="cq-sound-title">
        {[
          { value: true, label: 'On' },
          { value: false, label: 'Off' },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={on === option.value}
            className={`cq-segmented-btn${on === option.value ? ' cq-segmented-btn--active' : ''}`}
            onClick={() => choose(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
