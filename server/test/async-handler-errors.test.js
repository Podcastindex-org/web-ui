/*
 * Self-contained test: a failing Podcast Index API call inside an async route
 * handler must turn into an error response, not crash the server.
 *
 * Express 4 does not catch errors thrown by async handlers, and on Node 15+
 * an unhandled promise rejection terminates the process. On 2026-10-22 one
 * bad "add feed" URL took the site down this way.
 *
 * podcast-index-api is replaced with a stub whose calls all reject, so this
 * runs offline. Plain Node script, like the other server test: boot the app
 * on an ephemeral port, make real requests, assert, exit non-zero on failure.
 *
 * Run with:  node server/test/async-handler-errors.test.js
 */
const assert = require('assert')
const path = require('path')
const fetch = require('node-fetch')

// What each stubbed API method rejects with. podcast-index-api rejects with
// { message, code } when the API returns an error.
const API_ERRORS = {
  podcastsByFeedUrl: { message: 'Feed url not found.', code: 400 },
  addByFeedUrl: { message: 'Invalid feed url.', code: 400 },
  podcastsByFeedId: new Error('socket hang up'),
  episodesById: new Error('socket hang up'),
}

const stubPath = require.resolve('podcast-index-api', {
  paths: [path.join(__dirname, '..')],
})
require.cache[stubPath] = {
  id: stubPath,
  filename: stubPath,
  loaded: true,
  exports: () =>
    new Proxy(
      {},
      {
        get: (target, name) => async () => {
          throw API_ERRORS[name] || new Error(`stubbed ${String(name)} failed`)
        },
      }
    ),
}

process.env.POW_DIFFICULTY = '0'
const app = require('../index')

async function run() {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  const base = `http://127.0.0.1:${port}`

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
  const get = (urlPath) => fetch(base + urlPath, { timeout: 5000 })

  try {
    // --- API error with a status code: passed through in the API's shape ---
    const lookup = await get('/api/podcasts/byfeedurl?url=www.healthline.com')
    const lookupBody = await lookup.json()
    check('API error returns its status code', () =>
      assert.strictEqual(lookup.status, 400)
    )
    check('API error body has the API shape and message', () =>
      assert.deepStrictEqual(lookupBody, {
        status: 'false',
        description: 'Feed url not found.',
      })
    )

    const add = await get('/api/add/byfeedurl?url=www.healthline.com')
    const addBody = await add.json()
    check('add feed error returns the API message', () => {
      assert.strictEqual(add.status, 400)
      assert.strictEqual(addBody.description, 'Invalid feed url.')
    })

    // --- Error without a status code (network failure): generic 502 ---
    const search = await get('/api/search/byterm?q=test')
    const searchBody = await search.json()
    check('network error returns 502', () =>
      assert.strictEqual(search.status, 502)
    )
    check('network error does not leak the error message', () =>
      assert.deepStrictEqual(searchBody, {
        status: 'false',
        description: 'Request failed.',
      })
    )

    // --- Podcast page: lookup failure must not crash the page route ---
    const page = await get('/podcast/920666?episode=123')
    check('podcast page does not answer 502 when its lookup fails', () =>
      assert.notStrictEqual(page.status, 502)
    )

    // --- The server is still up after all of the above ---
    const after = await get('/api/auth/config')
    check('server still answers after the failures', () =>
      assert.strictEqual(after.status, 200)
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
