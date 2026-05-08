# Public Datasets Page — Design

## Goal

Publish the contents of `public_datasets.json` (currently maintained in the sibling `podcastindex.org` repo) as a browsable page on `podcastindex.org`, reachable from the top-bar navigation as **Datasets**.

The data is a single JSON document with:

- `title` (string)
- `tagline` (string)
- `intro` (string, prose)
- `sections[]` — each with `id`, `name`, `description`, `datasets[]`
- `datasets[]` — each with `name`, `url`, `format`, `cadence`, `description`

Roughly 3 sections × ~5 datasets each. Static, slow-changing.

## Non-goals

- No in-page search or filter (dataset count is small).
- No active-section highlighting in the table of contents (can be added later).
- No automated sync from the source repo. The Stats page is not being removed; only its top-bar link.

## Architecture

The implementation reuses the existing pattern used for `apps.json`, `stats.json`, and `newfeedstats.json`: a JSON file is committed under `server/data/`, the express server reads it on request and exposes it under `/api/...`, and a React page fetches it on mount.

### Data sync

`public_datasets.json` is copied manually from `/mnt/c/Users/dave/PhpstormProjects/podcastindex.org/data/public_datasets.json` to `web-ui/server/data/public_datasets.json` and committed to the repo. When the source changes, re-copy and re-commit. No script, no symlink, no runtime cross-repo path.

### API endpoint

`server/index.js` gains a handler:

```
app.use('/api/datasets', async (req, res) => {
  fs.readFile('./server/data/public_datasets.json', 'utf8', (err, data) => {
    if (err) { res.status(500).send({}); return }
    res.send(JSON.parse(data))
  })
})
```

This mirrors the existing `/api/stats` and `/api/apps` handlers.

### SSR fall-through

`server/index.js` gains a `/datasets` handler that renders the EJS index template, matching the existing handlers for `/stats` and `/search`. This makes the URL work on direct hit / refresh in production.

### Client route

`ui/src/routes.tsx` gains:

```
<Route path="/datasets" component={Datasets}/>
```

placed alongside the other top-level routes.

### TopBar navigation

`ui/src/components/TopBar/index.tsx` — replace the existing Stats button with a Datasets button. Final order:

```
Apps · Value 4 Value · Datasets · Add · Docs · API
```

The `/stats` route remains reachable for anyone who has the URL; only the top-bar link is removed.

## Page layout: `ui/src/pages/Datasets/`

The page renders, top to bottom:

1. **Header** — `title` (h1), `tagline` (subhead), `intro` (paragraph).
2. **Table of contents** — a single horizontal anchor list rendered immediately under the header, sticky to the top of the viewport on scroll. Lists each section's `name` as an anchor link to `#<section.id>`. Single-column layout on all viewports (no separate sidebar). Plain anchor list — no scroll-spy / active highlight in v1.
3. **Sections** — each rendered with an `id` matching the JSON, a heading (`section.name`), the section description paragraph, and a grid of dataset cards.
4. **Dataset card** — the dataset `name` is the card heading and is also a link to `dataset.url` (opens in a new tab via `target="_blank" rel="noopener noreferrer"`). Two small badges below the heading display `format` and `cadence`. The `description` follows as the body paragraph.

### Component breakdown

- `index.tsx` — page container. Owns state `{ loading: boolean, error: boolean, data: DatasetsDoc | null }`. Fetches `/api/datasets` in `componentDidMount` (matches the class-component pattern used by the Stats page). Sets the page title via the existing `updateTitle` helper. Composes header + ToC + sections.
- `Section.tsx` — renders one section: the anchor heading and description, and a list of `DatasetCard`s.
- `DatasetCard.tsx` — renders one dataset: linked name, format/cadence badges, description.
- `TableOfContents.tsx` — renders the anchor list. Sticky via CSS only.
- `styles.scss` — page layout, section spacing, card grid, badge styles, sticky ToC.

### Types

A small TypeScript interface lives at the top of `index.tsx` (or in a sibling `types.ts` if it grows). Shape:

```
interface Dataset {
  name: string
  url: string
  format: string
  cadence: string
  description: string
}

interface Section {
  id: string
  name: string
  description: string
  datasets: Dataset[]
}

interface DatasetsDoc {
  title: string
  tagline: string
  intro: string
  sections: Section[]
}
```

## Data flow

1. User navigates to `/datasets` (in-app `<Link>` from the top bar, or direct URL).
2. For a direct URL hit, the express `/datasets` handler renders the EJS shell. For an in-app navigation, the React router handles it without a server round-trip.
3. `<Datasets />` mounts → `fetch('/api/datasets')` → express reads `./server/data/public_datasets.json` and returns the parsed JSON.
4. Component sets state and renders the header, ToC, and sections.
5. Clicking an outbound dataset link opens it in a new tab.
6. Clicking a ToC entry jumps to the section's anchor (browser-native).

## Error handling

- **Loading**: while `fetch` is pending, show a brief loading indicator (or just the header with the rest blank — match the Stats page's minimal approach).
- **Fetch failure** (network error or non-2xx): set `error: true` and render an inline message: "Couldn't load datasets. Try refreshing." No retry, no toast.
- **Server file read failure**: return `500` with `{}`, matching `/api/stats`. The client treats it as a fetch failure.

## Files changed

**New**
- `server/data/public_datasets.json`
- `ui/src/pages/Datasets/index.tsx`
- `ui/src/pages/Datasets/Section.tsx`
- `ui/src/pages/Datasets/DatasetCard.tsx`
- `ui/src/pages/Datasets/TableOfContents.tsx`
- `ui/src/pages/Datasets/styles.scss`

**Edited**
- `server/index.js` — add `/api/datasets` handler and `/datasets` SSR fall-through.
- `ui/src/routes.tsx` — add `<Route path="/datasets" component={Datasets}/>` and the corresponding `import`.
- `ui/src/components/TopBar/index.tsx` — replace the Stats button with the Datasets button.

## Verification

- Direct hit: `http://localhost:5001/datasets` renders the page after the bundle loads, with all sections present and all outbound links present.
- In-app nav: clicking the Datasets top-bar button on any page lands on `/datasets`.
- ToC: clicking a section name jumps the viewport to that section.
- API: `curl http://localhost:5001/api/datasets` returns the JSON with HTTP 200.
- Stats button is no longer present in the top bar; visiting `/stats` directly still loads the Stats page.

## Out of scope

- Automated sync of `public_datasets.json` from the sibling repo.
- In-page search/filter.
- Active-section highlighting in the ToC.
- Removing or changing the Stats page itself.
