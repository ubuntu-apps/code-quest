// Makes a supporter code for the supporter edition of the certificate.
//
//   npm run supporter-code            a new random code
//   npm run supporter-code -- MYCODE  a code you choose
//
// Add the printed hash to supporterCodeHashes in src/features/support/supportConfig.ts,
// and set the thank-you link as the "after payment" page (or put the code in the receipt).
// Anyone with the code or link can use it: it is a thank-you, not copy protection.
import { createHash, randomBytes } from 'node:crypto'

const SITE = 'https://ubuntu-apps.github.io/code-quest'
// No 0/O or 1/I, so codes are easy to read off a receipt.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode() {
  const bytes = randomBytes(8)
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
  return `CQ-${chars.slice(0, 4)}-${chars.slice(4)}`
}

// The app trims and upper-cases codes before hashing (normalizeSupporterCode).
const code = (process.argv[2] ?? randomCode()).trim().toUpperCase()
const hash = createHash('sha256').update(code).digest('hex')

console.log(`Code:             ${code}`)
console.log(`Hash (config):    '${hash}',`)
console.log(`Thank-you link:   ${SITE}/supporter?code=${encodeURIComponent(code)}`)
