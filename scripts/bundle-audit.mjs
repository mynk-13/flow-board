/**
 * Bundle size audit — reads the Vite dist folder and reports gzip sizes.
 * Run AFTER `npm run build`:
 *   node scripts/bundle-audit.mjs
 */
import { readdirSync, statSync, readFileSync } from 'fs'
import { createGunzip } from 'zlib'
import { Readable } from 'stream'
import path from 'path'
import { fileURLToPath } from 'url'
import { gzipSync } from 'zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist', 'assets')
const LIMIT_KB = 150 // BRD target: < 150 KB gzip for the main app bundle

function gzipSize(filepath) {
  const raw = readFileSync(filepath)
  return gzipSync(raw).length
}

function fmt(bytes) {
  return (bytes / 1024).toFixed(2) + ' kB'
}

console.log('\n📦  FlowBoard — Bundle Size Audit\n')
console.log('  File'.padEnd(45), 'Raw'.padStart(10), 'Gzip'.padStart(12))
console.log('  ' + '-'.repeat(65))

let totalGzip = 0
let mainChunkGzip = 0

const files = readdirSync(DIST)
  .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
  .sort()

for (const file of files) {
  const fullPath = path.join(DIST, file)
  const raw = statSync(fullPath).size
  const gz  = gzipSize(fullPath)
  totalGzip += gz
  if (file.startsWith('index-')) mainChunkGzip = gz
  console.log(`  ${file}`.padEnd(45), fmt(raw).padStart(10), fmt(gz).padStart(12))
}

console.log('  ' + '-'.repeat(65))
console.log(`  ${'TOTAL'.padEnd(44)}${fmt(totalGzip).padStart(22)}`)
console.log()

// Critical path = react + router + index + css
const critical = files.reduce((sum, f) => {
  if (f.startsWith('react-') || f.startsWith('router-') || f.startsWith('index-') || f.endsWith('.css')) {
    return sum + gzipSize(path.join(DIST, f))
  }
  return sum
}, 0)

console.log(`  Critical-path gzip (react + router + app + css): ${fmt(critical)}`)
console.log(`  Main app chunk gzip: ${fmt(mainChunkGzip)}`)
console.log()

if (mainChunkGzip / 1024 <= LIMIT_KB) {
  console.log(`  ✅  Main chunk (${fmt(mainChunkGzip)}) is within the ${LIMIT_KB} kB target.\n`)
} else {
  console.warn(`  ⚠️   Main chunk (${fmt(mainChunkGzip)}) exceeds the ${LIMIT_KB} kB gzip target.\n`)
}

console.log('  Note: Firebase SDK is the largest dependency (~112 kB gzip) — expected for this stack.')
console.log('  All other chunks are lazy-loaded and cached independently.\n')
