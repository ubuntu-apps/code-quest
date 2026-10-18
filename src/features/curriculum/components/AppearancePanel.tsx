import { setTheme, useTheme, type ThemeChoice } from '../../../theme'

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Same as device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

/** About tab: light or dark colours, or follow the device's setting. */
export function AppearancePanel() {
  const theme = useTheme()
  return (
    <section className="cq-panel cq-appearance">
      <h2 className="cq-subtitle" id="cq-appearance-title">
        Appearance
      </h2>
      <div className="cq-segmented" role="radiogroup" aria-labelledby="cq-appearance-title">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={theme === option.value}
            className={`cq-segmented-btn${theme === option.value ? ' cq-segmented-btn--active' : ''}`}
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
