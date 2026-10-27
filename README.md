# CRUD Tests — Google Calendar

End-to-end tests for create, read, update and delete operations on Google Calendar events,
built with [Playwright](https://playwright.dev/) and TypeScript and run in GitHub Actions.

## Contents

- [Test cases](#test-cases)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Authentication](#authentication)
- [Running tests](#running-tests)
- [Configuration](#configuration)
- [CI/CD](#cicd)
- [How the tests work](#how-the-tests-work)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

## Test cases

| Test | What it does | Checks |
|------|--------------|--------|
| **CREATE** | Creates an event titled `Playwright Test Event` | The event opens and shows its title |
| **READ** | Opens the event created by CREATE | The details view shows its title |
| **UPDATE** | Renames the event to `Updated Playwright Test Event` | The details view shows the new title |
| **DELETE** | Deletes the event | No event with that title is left on the calendar |

The four tests share one event and must run in this order (see [How the tests work](#how-the-tests-work)).

## Project structure

```
CRUD-tests/
├── tests/
│   └── google-calendar-crud.spec.ts  # the four CRUD scenarios
├── pages/
│   └── CalendarPage.ts               # Page Object for Google Calendar
├── data/
│   └── testData.ts                   # event titles
├── scripts/
│   └── save-auth.js                  # saves the Google session (npm run auth)
├── .github/workflows/
│   └── playwright.yml                # GitHub Actions pipeline
└── playwright.config.ts              # Playwright configuration
```

Generated and git-ignored: `playwright/.auth/` (session and Chrome profile), `test-results/`,
`playwright-report/`.

## Requirements

- Node.js LTS
- A Google account whose Calendar UI is set to **Ukrainian** (some locators match Ukrainian labels only,
  see [Known limitations](#known-limitations))
- Google Chrome installed as `google-chrome` (Linux), used for the manual login
- [GitHub CLI](https://cli.github.com/) (`gh`), only for updating the CI secret

## Installation

```bash
git clone git@github.com:ixand/CRUD-tests.git
cd CRUD-tests
npm install
npx playwright install chromium
```

## Authentication

The tests never log in. They start from a saved Google session (`playwright/.auth/user.json`),
which Playwright loads as `storageState` before every test.

The session has to come from a manual login. Google blocks sign-in from browsers driven by
Playwright and shows *"Couldn't sign you in. This browser or app may not be secure"*, so a
scripted login cannot work.

### Saving a session

```bash
npm run auth            # saves playwright/.auth/user.json
npm run auth -- --push  # also updates the PLAYWRIGHT_AUTH_STATE secret in GitHub
```

1. Chrome opens with a separate profile at `playwright/.auth/chrome-profile`.
2. Sign in to the test account and wait until the calendar loads.
3. Close the Chrome window completely. The script waits for that.
4. The script reopens the same profile through Playwright, checks that the calendar opens
   without a sign-in redirect, and writes the session to `playwright/.auth/user.json`.
   It exits with code 1 if the calendar does not open.

The profile is kept between runs, so later refreshes usually need no password: just close the
window once the calendar is visible.

### When to refresh

Google expires sessions on its own schedule. Run `npm run auth -- --push` again when tests start
failing because the page shows the Google sign-in screen instead of the calendar.

## Running tests

```bash
npm test                         # all tests (headed locally)
npx playwright test -g "CREATE"  # a single test by name
npm run test:ui                  # Playwright UI mode
npm run test:debug               # step through with the inspector
npm run report                   # open the last HTML report

CI=1 npx playwright test         # run the way CI does: headless, 2 retries
```

Run the whole file rather than single tests when you can. READ, UPDATE and DELETE expect the event
that CREATE makes.

## Configuration

Set in [`playwright.config.ts`](playwright.config.ts):

| Setting | Local | CI (`CI` env set) |
|---------|-------|-------------------|
| Browser | Desktop Chrome (Playwright Chromium) | same |
| Headless | no | yes |
| Retries | 0 | 2 |
| Workers | default | 1 |
| Test timeout | 60 s | 60 s |
| `expect` timeout | 10 s | 10 s |
| Trace | on first retry | on first retry |
| Screenshot / video | on failure | on failure |
| Reporter | HTML, never auto-opened | same |

`fullyParallel` is off, so tests in the spec file run one after another in file order.

The HTML reporter is set to `open: 'never'` on purpose. With the default (`on-failure`) a failed
run starts a local report server and waits for Ctrl+C, which hangs a CI job until it times out.

## CI/CD

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull
request to `main`/`master`:

1. Check out the code and set up Node.js LTS.
2. `npm ci`.
3. `npx playwright install --with-deps chromium` (10 min timeout). Only Chromium is installed; the
   tests use nothing else.
4. Write the `PLAYWRIGHT_AUTH_STATE` secret to `playwright/.auth/user.json`.
5. `npx playwright test` (20 min timeout).
6. Upload `playwright-report/` and `test-results/` as the `playwright-artifacts` artifact, kept for
   30 days, whether the tests passed or not.

The whole job has a 60 minute limit. A normal run takes about one minute.

### Repository secrets

| Secret | Contents |
|--------|----------|
| `PLAYWRIGHT_AUTH_STATE` | The JSON from `playwright/.auth/user.json`. Set it with `npm run auth -- --push`. |

## How the tests work

Every test starts in a fresh browser context with the saved session and opens
`https://calendar.google.com`. All page interaction goes through
[`CalendarPage`](pages/CalendarPage.ts).

**Creating an event:** *Create → Event* opens the quick-create dialog; *More options* opens the full
editor; the title is filled and *Save* is clicked. Google places the event at the next time slot
today, so it appears in the current week view.

**Finding an event:** events in the calendar grid are buttons whose accessible name contains the
title. `getEventByTitle` matches that name with a case-insensitive regular expression and takes the
first match.

**Waiting:** the tests rely on Playwright's auto-waiting. `click()` and `fill()` wait for the element
to be visible, stable and enabled, and `expect` assertions retry until their timeout. There are no
fixed sleeps. One exception needs a retry loop: a click on *Create* right after the page loads is
sometimes ignored while Google's scripts start, so `createButtonMenu` repeats the click with
`expect(...).toPass()` until the menu appears.

**Save button:** while the full editor is open, the quick-create dialog stays in the DOM underneath
it with a second *Save* button. Both count as visible, so the locator selects the editor's button by
its `aria-label`, which the dialog's button does not have.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Tests fail and the screenshot shows the Google sign-in page | The session expired | `npm run auth -- --push` |
| `Error reading storage state from playwright/.auth/user.json` | No session saved yet | `npm run auth` |
| `browserType.launch: Executable doesn't exist` | Playwright's Chromium is not installed | `npx playwright install chromium` |
| `strict mode violation … resolved to 2 elements` | Google changed its markup and a locator now matches twice | Inspect `error-context.md` in `test-results/` and narrow the locator |
| Timeout waiting for a button by name | The UI language is not Ukrainian, or Google renamed the label | Check the page snapshot in `test-results/` |
| Several `Playwright Test Event` entries on the calendar | An earlier run stopped between CREATE and DELETE | Delete the leftover events by hand |
| `npm run auth` reports no session | Chrome was closed before the calendar loaded | Run it again and wait for the calendar |

Every failed test leaves `test-failed-1.png`, `video.webm` and `error-context.md` (an accessibility
snapshot of the page) in `test-results/`. In CI these are in the `playwright-artifacts` artifact.

## Known limitations

- **Tests depend on each other.** READ, UPDATE and DELETE use the event made by CREATE. If CREATE
  fails, the rest fail too, and an interrupted run can leave events on the calendar.
- **Title matching is by substring.** `Playwright Test Event` also matches
  `Updated Playwright Test Event`. DELETE removes the renamed event only because of this, and a
  leftover event from an earlier run can be picked instead of the new one.
- **Ukrainian UI only.** *More options* (`Інші параметри`) and *Edit event* (`Змінити подію`) are
  matched by their Ukrainian labels. Other locators accept Ukrainian or English.
- **Sessions expire.** CI fails after Google expires the session; refresh it as described in
  [Authentication](#authentication). Google can expire a session sooner when it is used from
  GitHub's servers.
- **`npm run auth` is Linux-only** as written, because it starts Chrome as `google-chrome`.
