import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { redeemSupporterCode } from './supporterStorage'
import { tabPath } from '../curriculum/learnPaths'

export type SupporterResult = 'thanks' | 'bad-code'

/**
 * The thank-you link supporters get after paying: /supporter?code=…  It turns on the
 * supporter features on this device, then opens About, which says whether it worked.
 */
export function SupporterLanding() {
  const [result, setResult] = useState<SupporterResult | null>(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code') ?? ''
    void redeemSupporterCode(code).then((ok) => setResult(ok ? 'thanks' : 'bad-code'))
  }, [])

  if (result) return <Navigate to={tabPath('about')} replace state={{ supporterResult: result }} />
  return (
    <div className="cq-panel cq-muted" style={{ margin: '2rem auto', maxWidth: 480 }}>
      Checking your supporter code…
    </div>
  )
}
