import { useId, useState, type FormEvent } from 'react'
import { redeemSupporterCode } from './supporterStorage'

/** Where a supporter types the code they got after paying, if the thank-you link didn't open. */
export function SupporterCodeForm() {
  const inputId = useId()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong'>('idle')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('checking')
    const ok = await redeemSupporterCode(code)
    // On success the supporter view replaces this form.
    setStatus(ok ? 'idle' : 'wrong')
  }

  return (
    <form className="cq-supporter-code" onSubmit={(e) => void submit(e)}>
      <label className="cq-label" htmlFor={inputId}>
        Supporter code
      </label>
      <div className="cq-row">
        <input
          id={inputId}
          className="cq-text-input cq-supporter-code-input"
          value={code}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(e) => {
            setCode(e.target.value)
            setStatus('idle')
          }}
        />
        <button type="submit" className="cq-btn" disabled={code.trim() === '' || status === 'checking'}>
          {status === 'checking' ? 'Checking…' : 'Apply'}
        </button>
      </div>
      <p className="cq-muted cq-supporter-code-status" role="status">
        {status === 'wrong' ? "That code didn't work. Check it against your receipt and try again." : ''}
      </p>
    </form>
  )
}
