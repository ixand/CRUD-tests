# CRUD Tests — Google Calendar

E2E tests for verifying CRUD operations in Google Calendar, built with [Playwright](https://playwright.dev/) + TypeScript.

## Test Cases

| Test | Description |
|------|-------------|
| **CREATE** | Create a new event in the calendar |
| **READ** | Read details of an existing event |
| **UPDATE** | Update the title of an existing event |
| **DELETE** | Delete an event and verify it no longer exists |

## Project Structure

```
CRUD-tests/
├── tests/
│   ├── google-calendar-crud.spec.ts  # CRUD test scenarios
│   └── auth.setup.ts                 # authentication setup
├── pages/
│   ├── CalendarPage.ts               # Page Object for Google Calendar
│   └── LoginPage.ts                  # Page Object for the login page
├── data/
│   └── testData.ts                   # test data (event titles, user credentials)
├── .github/workflows/
│   └── playwright.yml                # CI/CD pipeline (GitHub Actions)
└── playwright.config.ts              # Playwright configuration
```

## Requirements

- Node.js LTS
- A Google account with access to Google Calendar

## Installation

```bash
git clone git@github.com:ixand/CRUD-tests.git
cd CRUD-tests
npm install
npx playwright install
```

## Environment Setup

Create a `.env` file in the project root:

```env
GOOGLE_EMAIL=your@gmail.com
GOOGLE_PASSWORD=yourpassword
```

### Auth State (session persistence)

Before the first run, save the authentication state:

```bash
npx playwright test --project=auth
```

This will create `playwright/.auth/user.json` with your Google session cookies.

## Running Tests

```bash
# All tests
npx playwright test

# With UI mode
npx playwright test --ui

# A specific test
npx playwright test -g "CREATE"

# With HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## CI/CD

GitHub Actions automatically runs tests on push to `main`/`master`.

Required repository secrets (Settings → Secrets):

| Secret | Description |
|--------|-------------|
| `GOOGLE_EMAIL` | Google account email |
| `GOOGLE_PASSWORD` | Google account password |
| `PLAYWRIGHT_AUTH_STATE` | Contents of `playwright/.auth/user.json` |
