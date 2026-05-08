# Datasets Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `public_datasets.json` (from the sibling api project) as a browsable `/datasets` page on podcastindex.org, reachable from the top bar.

**Architecture:** Reuse the existing static-JSON pattern (`apps.json`, `stats.json`): commit a copy of the data under `server/data/`, expose it via `/api/datasets`, and have a React page fetch it on mount. The page renders the document header, a sticky horizontal table of contents, and one section block per JSON section with a grid of dataset cards.

**Tech Stack:** Express 4 (server), React 16 + TypeScript 3.7 (function components with hooks), SASS, react-router-dom 5. No build-tooling additions required.

**Note on tests:** The codebase has no existing unit/integration tests for pages or server endpoints — no `*.test.*`, no `__tests__`, no test setup beyond the unconfigured `react-scripts test`. Introducing test infrastructure is out of scope for this feature. Tasks use **manual verification steps** (`curl` for endpoints, dev-server visual checks for UI) instead of TDD. Each task ends with a commit so progress is recoverable.

**Spec:** `docs/superpowers/specs/2026-05-06-datasets-page-design.md`

---

## File Structure

**New files**
- `server/data/public_datasets.json` — copied verbatim from the sibling project; canonical source of page content.
- `ui/src/pages/Datasets/index.tsx` — page container; fetches `/api/datasets`, manages loading/error state, composes header + ToC + sections.
- `ui/src/pages/Datasets/Section.tsx` — renders one section (anchor heading + description + dataset card grid).
- `ui/src/pages/Datasets/DatasetCard.tsx` — renders one dataset (linked name + format/cadence badges + description).
- `ui/src/pages/Datasets/TableOfContents.tsx` — renders the sticky horizontal anchor list.
- `ui/src/pages/Datasets/styles.scss` — page-scoped layout, card grid, badges, sticky ToC.

**Modified files**
- `server/index.js` — add `/api/datasets` static-JSON handler and `/datasets` SSR fall-through handler.
- `ui/src/routes.tsx` — add the `<Route exact path="/datasets" .../>` and the corresponding `import`.
- `ui/src/components/TopBar/index.tsx` — remove the Stats button; add a Datasets button in the same slot.

---

## Prerequisites

Before starting, confirm working directory is the repo root: `/mnt/c/Users/dave/PhpstormProjects/web-ui`. Confirm the sibling source file exists:

```
ls /mnt/c/Users/dave/PhpstormProjects/podcastindex.org/data/public_datasets.json
```

If it does not exist, stop and ask before proceeding.

---

## Task 1: Copy the data file and expose it via `/api/datasets`

**Files:**
- Create: `server/data/public_datasets.json`
- Modify: `server/index.js` (add new handler immediately after the `/api/apps` handler around line 336)

- [ ] **Step 1: Copy the source JSON into the repo**

```bash
cp /mnt/c/Users/dave/PhpstormProjects/podcastindex.org/data/public_datasets.json server/data/public_datasets.json
```

Verify it copied:

```bash
ls -la server/data/public_datasets.json
head -5 server/data/public_datasets.json
```

Expected: file exists, first line is `{` and second line is `    "title": "Public Data",`.

- [ ] **Step 2: Add the `/api/datasets` handler in `server/index.js`**

Locate the existing `/api/apps` handler in `server/index.js`:

```js
app.use('/api/apps', async (req, res) => {
  fs.readFile('./server/data/apps.json', 'utf8', (err, data) => {
    // You should always specify the content type header,
    // when you don't use 'res.json' for sending JSON.
    res.set('Content-Type', 'application/json')
    res.send(data)
  })
})
```

Immediately after that block (and before `app.use('/api/images', ...)`), insert:

```js
app.use('/api/datasets', async (req, res) => {
  fs.readFile('./server/data/public_datasets.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send({})
      return
    }
    res.set('Content-Type', 'application/json')
    res.send(data)
  })
})
```

The shape mirrors the existing static-JSON handlers; the `if (err)` guard implements the 500-on-read-failure behavior the spec calls for.

- [ ] **Step 3: Start the express server and verify the endpoint**

In one terminal:

```bash
yarn run start
```

In another terminal:

```bash
curl -s -o /tmp/datasets.json -w "%{http_code}\n" http://localhost:5001/api/datasets
head -3 /tmp/datasets.json
```

Expected:
- HTTP code: `200`
- First line of body: `{`
- Second line of body: `    "title": "Public Data",`

Stop the server (Ctrl-C) once verified.

- [ ] **Step 4: Commit**

```bash
git add server/data/public_datasets.json server/index.js
git commit -m "$(cat <<'EOF'
Add /api/datasets endpoint serving public_datasets.json

Mirrors the existing /api/apps and /api/stats static-JSON handlers.
The data file is copied from the podcastindex.org api project.
EOF
)"
```

---

## Task 2: Add `/datasets` SSR fall-through

**Files:**
- Modify: `server/index.js` (add a new handler immediately after the `/stats` handler around line 418)

- [ ] **Step 1: Add the `/datasets` SSR handler**

Locate the existing `/stats` handler in `server/index.js`:

```js
app.use('/stats', (req, res) => {
  res.render('index', {
    title: 'Stats',
    path: req.originalUrl,
  })
})
```

Immediately after that block (and before the `Static content for client` comment / `app.use(express.static(...))` lines), insert:

```js
app.use('/datasets', (req, res) => {
  res.render('index', {
    title: 'Datasets',
    description:
      'Open datasets generated and published by the Podcast Index project.',
    path: req.originalUrl,
  })
})
```

The `description` is taken from the source JSON's `tagline` so the OG/Twitter meta tags carry useful copy on direct hits.

- [ ] **Step 2: Verify the SSR handler renders**

Start the server again:

```bash
yarn run start
```

In another terminal:

```bash
curl -s http://localhost:5001/datasets | grep -E '<title>|"og:title"' | head -4
```

Expected: title contains `Datasets | Podcastindex.org` and the `og:title` meta tag matches.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add server/index.js
git commit -m "$(cat <<'EOF'
Add /datasets SSR handler

Renders the EJS shell with title and description so direct hits and
crawlers see proper meta tags.
EOF
)"
```

---

## Task 3: Add the Datasets route and a stub page

This task gets the URL fully reachable end-to-end (server → bundle → mounted page) so later tasks can iterate against a live page in the dev server.

**Files:**
- Create: `ui/src/pages/Datasets/index.tsx` (stub)
- Create: `ui/src/pages/Datasets/styles.scss` (empty placeholder)
- Modify: `ui/src/routes.tsx`

- [ ] **Step 1: Create the empty stylesheet**

Create `ui/src/pages/Datasets/styles.scss` with just a comment so the import in the next step has something to load:

```scss
// Datasets page styles — populated in a later task.
```

- [ ] **Step 2: Create the stub page**

Create `ui/src/pages/Datasets/index.tsx`:

```tsx
import * as React from 'react'
import { useEffect } from 'react'

import { updateTitle } from '../../utils'

import './styles.scss'

const Datasets: React.FunctionComponent = () => {
    useEffect(() => {
        updateTitle('Datasets')
    }, [])

    return (
        <div className="datasets-page">
            <p>Datasets page — content coming.</p>
        </div>
    )
}

export default Datasets
```

- [ ] **Step 3: Wire the route in `routes.tsx`**

Open `ui/src/routes.tsx`. Add this import alongside the other page imports (alphabetically — between `Apps` and `DonationThankYou`):

```tsx
import Datasets from './pages/Datasets'
```

Then add a new `<Route>` element inside the `<Switch>`, immediately after the `/stats` route (which is `<Route exact path="/stats" render={() => <Stats/>}/>`):

```tsx
<Route exact path="/datasets" component={Datasets}/>
```

For reference the final `<Switch>` block should look like:

```tsx
<Switch>
    <Route exact path="/" render={() => <Landing/>}/>
    <Route
        path="/search"
        render={(props) => <Search {...props} history={history}/>}
    />
    <Route path="/thankyou" component={DonationThankYou}/>
    <Route exact path="/stats" render={() => <Stats/>}/>
    <Route exact path="/datasets" component={Datasets}/>

    <Route path="/podcast" component={Podcast}/>

    <Route path="/apps" component={Apps}/>

    <Route path="/add" component={AddFeed}/>

    <Route component={() => <div>Not Found</div>}/>
</Switch>
```

- [ ] **Step 4: Verify the stub renders in dev**

In one terminal start the server:

```bash
yarn run start
```

In another, start the dev bundler:

```bash
yarn run dev
```

Open `http://localhost:9001/datasets` in a browser. Expect to see the text "Datasets page — content coming." rendered below the existing top bar. Browser title should read "Datasets | Podcastindex.org".

If TypeScript compilation fails, fix the error before continuing — typical issue is a missing import.

Leave both processes running for the remaining tasks.

- [ ] **Step 5: Commit**

```bash
git add ui/src/pages/Datasets/index.tsx ui/src/pages/Datasets/styles.scss ui/src/routes.tsx
git commit -m "$(cat <<'EOF'
Add /datasets route and stub page

Stub renders a placeholder so the route can be exercised end-to-end
while the page contents are built up in subsequent commits.
EOF
)"
```

---

## Task 4: Replace the Stats button with a Datasets button in the top bar

**Files:**
- Modify: `ui/src/components/TopBar/index.tsx` (around lines 149–154)

- [ ] **Step 1: Edit the TopBar links**

Open `ui/src/components/TopBar/index.tsx`. Locate the link block:

```tsx
<Button link href="/apps">Apps</Button>
<Button link href="/podcast/value4value">Value 4 Value</Button>
<Button link href="/stats">
    Stats
</Button>
<Button link href="/add">Add</Button>
```

Replace the `Stats` button line with a `Datasets` button so the block becomes:

```tsx
<Button link href="/apps">Apps</Button>
<Button link href="/podcast/value4value">Value 4 Value</Button>
<Button link href="/datasets">Datasets</Button>
<Button link href="/add">Add</Button>
```

The Stats route is intentionally retained but no longer linked from navigation.

- [ ] **Step 2: Verify in the browser**

The dev server should hot-reload. Refresh any page and confirm:
- Top-bar order reads: **Apps · Value 4 Value · Datasets · Add · Docs · API**.
- "Stats" button is gone.
- Clicking "Datasets" routes to `/datasets` (stub page).
- Visiting `http://localhost:9001/stats` directly still loads the Stats page (route still works).

- [ ] **Step 3: Commit**

```bash
git add ui/src/components/TopBar/index.tsx
git commit -m "$(cat <<'EOF'
Replace Stats top-bar link with Datasets

The Stats route is unchanged and still reachable directly; only the
top-bar entry changes.
EOF
)"
```

---

## Task 5: Build the `DatasetCard` component

**Files:**
- Create: `ui/src/pages/Datasets/DatasetCard.tsx`

- [ ] **Step 1: Create `DatasetCard.tsx`**

Create `ui/src/pages/Datasets/DatasetCard.tsx`:

```tsx
import * as React from 'react'

export interface Dataset {
    name: string
    url: string
    format: string
    cadence: string
    description: string
}

interface IProps {
    dataset: Dataset
}

const DatasetCard: React.FunctionComponent<IProps> = ({ dataset }) => {
    return (
        <div className="dataset-card">
            <h3 className="dataset-card-title">
                <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {dataset.name}
                </a>
            </h3>
            <div className="dataset-card-badges">
                <span className="dataset-card-badge">{dataset.format}</span>
                <span className="dataset-card-badge">{dataset.cadence}</span>
            </div>
            <p className="dataset-card-description">{dataset.description}</p>
        </div>
    )
}

export default DatasetCard
```

The `Dataset` interface is exported so `Section.tsx` and `index.tsx` can reuse it.

- [ ] **Step 2: Sanity-check the file compiles**

The dev server's TypeScript pass will compile on save. Watch the dev-server terminal for errors. There should be none. Browser is unchanged at this point — no caller yet.

- [ ] **Step 3: Commit**

```bash
git add ui/src/pages/Datasets/DatasetCard.tsx
git commit -m "Add DatasetCard component for the Datasets page"
```

---

## Task 6: Build the `Section` component

**Files:**
- Create: `ui/src/pages/Datasets/Section.tsx`

- [ ] **Step 1: Create `Section.tsx`**

Create `ui/src/pages/Datasets/Section.tsx`:

```tsx
import * as React from 'react'

import DatasetCard, { Dataset } from './DatasetCard'

export interface Section {
    id: string
    name: string
    description: string
    datasets: Dataset[]
}

interface IProps {
    section: Section
}

const SectionBlock: React.FunctionComponent<IProps> = ({ section }) => {
    return (
        <section id={section.id} className="datasets-section">
            <h2 className="datasets-section-title">{section.name}</h2>
            <p className="datasets-section-description">{section.description}</p>
            <div className="datasets-section-grid">
                {section.datasets.map((dataset) => (
                    <DatasetCard key={dataset.url} dataset={dataset} />
                ))}
            </div>
        </section>
    )
}

export default SectionBlock
```

The default export is named `SectionBlock` internally to avoid colliding with the exported `Section` interface. The `id={section.id}` attribute is what makes the table-of-contents anchor links work.

- [ ] **Step 2: Sanity-check the file compiles**

Watch the dev-server terminal. No errors expected.

- [ ] **Step 3: Commit**

```bash
git add ui/src/pages/Datasets/Section.tsx
git commit -m "Add Section component for the Datasets page"
```

---

## Task 7: Build the `TableOfContents` component

**Files:**
- Create: `ui/src/pages/Datasets/TableOfContents.tsx`

- [ ] **Step 1: Create `TableOfContents.tsx`**

Create `ui/src/pages/Datasets/TableOfContents.tsx`:

```tsx
import * as React from 'react'

import { Section } from './Section'

interface IProps {
    sections: Section[]
}

const TableOfContents: React.FunctionComponent<IProps> = ({ sections }) => {
    return (
        <nav className="datasets-toc" aria-label="Datasets sections">
            <ul className="datasets-toc-list">
                {sections.map((section) => (
                    <li key={section.id} className="datasets-toc-item">
                        <a
                            className="datasets-toc-link"
                            href={`#${section.id}`}
                        >
                            {section.name}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default TableOfContents
```

Plain anchor list — browser-native scroll behavior, no scroll-spy.

- [ ] **Step 2: Sanity-check the file compiles**

No errors expected.

- [ ] **Step 3: Commit**

```bash
git add ui/src/pages/Datasets/TableOfContents.tsx
git commit -m "Add TableOfContents component for the Datasets page"
```

---

## Task 8: Wire the Datasets page (fetch, state, render)

**Files:**
- Modify: `ui/src/pages/Datasets/index.tsx` (replace stub with full implementation)

- [ ] **Step 1: Replace the stub with the full page**

Open `ui/src/pages/Datasets/index.tsx` and replace its entire contents with:

```tsx
import * as React from 'react'
import { useEffect, useState } from 'react'

import { updateTitle } from '../../utils'
import SectionBlock, { Section } from './Section'
import TableOfContents from './TableOfContents'

import './styles.scss'

interface DatasetsDoc {
    title: string
    tagline: string
    intro: string
    sections: Section[]
}

const Datasets: React.FunctionComponent = () => {
    const [data, setData] = useState<DatasetsDoc | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        updateTitle('Datasets')
        let cancelled = false

        const load = async () => {
            try {
                const response = await fetch('/api/datasets', {
                    credentials: 'same-origin',
                    method: 'GET',
                })
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }
                const json: DatasetsDoc = await response.json()
                if (!cancelled) {
                    setData(json)
                    setLoading(false)
                }
            } catch (e) {
                if (!cancelled) {
                    setError(true)
                    setLoading(false)
                }
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return (
            <div className="datasets-page">
                <p className="datasets-loading">Loading datasets…</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="datasets-page">
                <p className="datasets-error">
                    Couldn't load datasets. Try refreshing.
                </p>
            </div>
        )
    }

    return (
        <div className="datasets-page">
            <header className="datasets-header">
                <h1 className="datasets-title">{data.title}</h1>
                <p className="datasets-tagline">{data.tagline}</p>
                <p className="datasets-intro">{data.intro}</p>
            </header>
            <TableOfContents sections={data.sections} />
            <div className="datasets-sections">
                {data.sections.map((section) => (
                    <SectionBlock key={section.id} section={section} />
                ))}
            </div>
        </div>
    )
}

export default Datasets
```

The `cancelled` flag prevents a setState-after-unmount warning if the user navigates away before the fetch resolves.

- [ ] **Step 2: Verify the page in the browser**

With both `yarn run start` and `yarn run dev` still running, refresh `http://localhost:9001/datasets`. Verify:

- Page title in browser tab: "Datasets | Podcastindex.org".
- Header shows "Public Data", the tagline, and the intro paragraph.
- Table of contents shows three links: "Catalog snapshots", "Discovery & recommendations", "Activity & stats".
- Three sections render below the ToC, each with a heading, description, and a grid of dataset cards.
- Each dataset card shows a title (linked), two badges (format, cadence), and a description.
- Clicking a card title opens the dataset URL in a new tab.
- Clicking a ToC link jumps the viewport to that section.

If the page shows "Couldn't load datasets", check that `yarn run start` is running and that `/api/datasets` returns 200 (`curl http://localhost:5001/api/datasets | head`).

- [ ] **Step 3: Commit**

```bash
git add ui/src/pages/Datasets/index.tsx
git commit -m "$(cat <<'EOF'
Wire Datasets page: fetch, loading/error state, render

The page fetches /api/datasets on mount, renders the document header,
a sticky table of contents, and one block per section with a grid of
dataset cards.
EOF
)"
```

---

## Task 9: Style the page

**Files:**
- Modify: `ui/src/pages/Datasets/styles.scss` (replace placeholder with real styles)

- [ ] **Step 1: Replace the placeholder stylesheet**

Open `ui/src/pages/Datasets/styles.scss` and replace its contents with:

```scss
.datasets-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 20px 64px;
    color: var(--fg-main);
}

.datasets-header {
    margin-bottom: 24px;
}

.datasets-title {
    font-family: var(--font-family-bold);
    font-size: 2.25rem;
    margin: 0 0 8px;
}

.datasets-tagline {
    font-size: 1.1rem;
    color: var(--text-color);
    margin: 0 0 16px;
}

.datasets-intro {
    line-height: 1.55;
    margin: 0;
}

.datasets-toc {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--bg-main);
    padding: 12px 0;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.datasets-toc-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.datasets-toc-item {
    margin: 0;
}

.datasets-toc-link {
    color: var(--link-color);
    text-decoration: none;
    font-family: var(--font-family-bold);
    font-size: 0.95rem;

    &:hover {
        color: var(--link-hover-color);
    }
}

.datasets-section {
    margin-bottom: 40px;
    scroll-margin-top: 80px; // so anchor jumps clear the sticky ToC
}

.datasets-section-title {
    font-family: var(--font-family-bold);
    font-size: 1.5rem;
    margin: 0 0 6px;
}

.datasets-section-description {
    color: var(--text-color);
    margin: 0 0 16px;
    line-height: 1.5;
}

.datasets-section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.dataset-card {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 16px;
    background: var(--bg-main);
    transition: box-shadow var(--transition-secs) ease;

    &:hover {
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }
}

.dataset-card-title {
    font-family: var(--font-family-bold);
    font-size: 1.05rem;
    margin: 0 0 8px;

    a {
        color: var(--link-color);
        text-decoration: none;

        &:hover {
            color: var(--link-hover-color);
            text-decoration: underline;
        }
    }
}

.dataset-card-badges {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
}

.dataset-card-badge {
    display: inline-block;
    background: rgba(0, 39, 82, 0.08);
    color: var(--link-color);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 0.75rem;
    font-family: var(--font-family-bold);
    text-transform: lowercase;
}

.dataset-card-description {
    margin: 0;
    line-height: 1.5;
    font-size: 0.95rem;
}

.datasets-loading,
.datasets-error {
    color: var(--text-color);
    padding: 24px 0;
}
```

The styles use the existing CSS custom properties from `ui/src/styles.scss` (`--bg-main`, `--fg-main`, `--text-color`, `--link-color`, `--link-hover-color`, `--font-family-bold`, `--transition-secs`) so dark-mode theming will pick up the page automatically.

- [ ] **Step 2: Verify the page renders correctly**

Refresh `http://localhost:9001/datasets`. Verify:

- The header sits at the top with bold title, lighter tagline, and full-width intro paragraph.
- The ToC sits below the header, stays pinned to the top of the viewport when you scroll, and has a subtle separator line.
- Sections have a clear heading and description; cards lay out in a responsive grid (3 columns on a wide window, 1–2 columns on narrow).
- Cards have rounded corners, a hover lift, and the format/cadence badges are pill-shaped.
- Clicking a ToC link jumps to the right section and the section title is *not* hidden behind the sticky ToC (`scroll-margin-top` handles this).
- Toggle dark mode using the existing theme button — colors should adapt because the styles use CSS variables.

If the sticky ToC overlaps section titles after a jump, increase `scroll-margin-top` on `.datasets-section`.

- [ ] **Step 3: Commit**

```bash
git add ui/src/pages/Datasets/styles.scss
git commit -m "$(cat <<'EOF'
Style Datasets page

Sticky horizontal table of contents, responsive grid of dataset cards,
themed via the existing CSS custom properties so dark mode works.
EOF
)"
```

---

## Task 10: Final end-to-end verification

This is a manual smoke test pass. No code changes; if a check fails, fix the underlying task and re-verify.

**Files:** none

- [ ] **Step 1: Restart both servers cleanly**

```bash
# In terminal 1 (after stopping any previous yarn run start):
yarn run start

# In terminal 2 (after stopping any previous yarn run dev):
yarn run dev
```

- [ ] **Step 2: Server-side checks**

```bash
curl -s -o /dev/null -w "/api/datasets %{http_code}\n" http://localhost:5001/api/datasets
curl -s http://localhost:5001/datasets | grep -o '<title>[^<]*</title>'
```

Expected:
- `/api/datasets 200`
- `<title>Datasets | Podcastindex.org</title>`

- [ ] **Step 3: Client-side checks**

In a browser, walk through:

1. Visit `http://localhost:9001/`. Confirm the top bar reads **Apps · Value 4 Value · Datasets · Add · Docs · API** and Stats is gone from the bar.
2. Click **Datasets**. URL becomes `/datasets`. Page renders header + ToC + sections.
3. Click each ToC link. Viewport jumps to the corresponding section heading without it being hidden under the sticky ToC.
4. Click a dataset card title. Opens the public.podcastindex.org URL in a new tab.
5. Visit `http://localhost:9001/stats` directly. Stats page still loads (the route was preserved).
6. Toggle dark mode. Datasets page colors adapt.

- [ ] **Step 4: Verify final git state is clean**

```bash
git status
git log --oneline | head -12
```

Expected: working tree clean; commit log shows the per-task commits in order.

- [ ] **Step 5: Stop both servers**

Ctrl-C the dev bundler and the express server.

No commit for this task — it is verification only.
