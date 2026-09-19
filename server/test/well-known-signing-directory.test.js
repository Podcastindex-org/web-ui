/*
 * Self-contained test for the Web Bot Auth key directory endpoint:
 *   GET /.well-known/http-message-signatures-directory
 *
 * There is no server-side test runner in this repo (`yarn test` is react-scripts
 * for the UI), so this file is a plain Node script: boot the Express app on an
 * ephemeral port, make real requests, assert, exit non-zero on failure.
 *
 * Run with:  node server/test/well-known-signing-directory.test.js
 */
const assert = require('assert')
const fetch = require('node-fetch')
const app = require('../index')

const PATH = '/.well-known/http-message-signatures-directory'
const EXPECTED_CONTENT_TYPE =
  'application/http-message-signatures-directory+json'

async function run() {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  const url = `http://127.0.0.1:${port}${PATH}`

  let failures = 0
  const check = (name, fn) => {
    try {
      fn()
      console.log(`  ok   - ${name}`)
    } catch (err) {
      failures++
      console.error(`  FAIL - ${name}\n         ${err.message}`)
    }
  }

  try {
    // --- GET ---
    const getRes = await fetch(url)
    const body = await getRes.text()

    check('GET returns 200', () => assert.strictEqual(getRes.status, 200))
    check('GET sets exact Content-Type', () =>
      assert.strictEqual(
        getRes.headers.get('content-type'),
        EXPECTED_CONTENT_TYPE
      )
    )
    check('GET sets a public Cache-Control', () => {
      const cc = getRes.headers.get('cache-control') || ''
      assert.ok(/public/.test(cc) && /max-age=\d+/.test(cc), `got "${cc}"`)
    })
    check('GET body is valid JSON with a keys array', () => {
      const json = JSON.parse(body)
      assert.ok(Array.isArray(json.keys), 'keys is not an array')
      assert.ok(json.keys.length >= 1, 'keys is empty')
      const k = json.keys[0]
      assert.strictEqual(k.kty, 'OKP')
      assert.strictEqual(k.crv, 'Ed25519')
      assert.ok('x' in k, 'missing x')
      assert.ok('kid' in k, 'missing kid')
    })
    check('GET body contains no private key material', () => {
      assert.ok(!/"d"\s*:/.test(body), 'response contains a private key "d"')
    })

    // --- HEAD ---
    const headRes = await fetch(url, { method: 'HEAD' })
    const headBody = await headRes.text()
    check('HEAD returns 200', () => assert.strictEqual(headRes.status, 200))
    check('HEAD sets exact Content-Type', () =>
      assert.strictEqual(
        headRes.headers.get('content-type'),
        EXPECTED_CONTENT_TYPE
      )
    )
    check('HEAD has an empty body', () =>
      assert.strictEqual(headBody, '')
    )
  } finally {
    server.close()
  }

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed`)
    process.exit(1)
  }
  console.log('\nAll checks passed')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
