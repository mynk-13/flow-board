/**
 * Lighthouse audit script — runs against a local or production URL.
 *
 * Usage (requires the app to be running):
 *   npm run lighthouse:run
 *   AUDIT_URL=https://your-vercel-app.vercel.app npm run lighthouse:run
 *
 * Install once:
 *   npm install --save-dev lighthouse
 */
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const OUT_DIR   = path.join(ROOT, 'lighthouse-reports')

const URL       = process.env.AUDIT_URL ?? 'http://localhost:4173'
const THRESHOLD = {
  performance:    90,
  accessibility:  90,
  'best-practices': 90,
  seo:            90,
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const outFile   = path.join(OUT_DIR, `report-${timestamp}.html`)

console.log(`\n🔦  Running Lighthouse against: ${URL}\n`)

try {
  execSync(
    [
      'npx lighthouse',
      `"${URL}"`,
      '--output html',
      `--output-path "${outFile}"`,
      '--chrome-flags="--headless --no-sandbox"',
      `--only-categories=${Object.keys(THRESHOLD).join(',')}`,
    ].join(' '),
    { stdio: 'inherit', cwd: ROOT }
  )
  console.log(`\n✅  Report saved → ${outFile}`)
} catch {
  console.error('\n❌  Lighthouse exited with errors. Check the HTML report for details.')
  process.exit(1)
}
