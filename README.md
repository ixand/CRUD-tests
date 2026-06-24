# CRUD Tests — Google Calendar

E2E тести для перевірки CRUD-операцій у Google Calendar, написані на [Playwright](https://playwright.dev/) + TypeScript.

## Тести

| Тест | Опис |
|------|------|
| **CREATE** | Створення нової події в календарі |
| **READ** | Читання деталей існуючої події |
| **UPDATE** | Оновлення назви існуючої події |
| **DELETE** | Видалення події та перевірка її відсутності |

## Структура проєкту

```
CRUD-tests/
├── tests/
│   ├── google-calendar-crud.spec.ts  # CRUD тест-сценарії
│   └── auth.setup.ts                 # налаштування авторизації
├── pages/
│   ├── CalendarPage.ts               # Page Object для Google Calendar
│   └── LoginPage.ts                  # Page Object для сторінки логіну
├── data/
│   └── testData.ts                   # тестові дані (назви подій, юзер)
├── .github/workflows/
│   └── playwright.yml                # CI/CD пайплайн (GitHub Actions)
└── playwright.config.ts              # конфігурація Playwright
```

## Вимоги

- Node.js LTS
- Google-акаунт з доступом до Google Calendar

## Встановлення

```bash
git clone git@github.com:ixand/CRUD-tests.git
cd CRUD-tests
npm install
npx playwright install
```

## Налаштування середовища

Створи файл `.env` у корені проєкту:

```env
GOOGLE_EMAIL=your@gmail.com
GOOGLE_PASSWORD=yourpassword
```

### Auth state (збереження сесії)

Перед першим запуском потрібно зберегти стан авторизації:

```bash
npx playwright test --project=auth
```

Це створить `playwright/.auth/user.json` з cookies сесії Google.

## Запуск тестів

```bash
# Усі тести
npx playwright test

# З UI-режимом
npx playwright test --ui

# Конкретний тест
npx playwright test -g "CREATE"

# З HTML-звітом
npx playwright test --reporter=html
npx playwright show-report
```

## CI/CD

GitHub Actions автоматично запускає тести при пуші в `main`/`master`.

Необхідні секрети в репозиторії (Settings → Secrets):

| Секрет | Опис |
|--------|------|
| `GOOGLE_EMAIL` | Email Google-акаунту |
| `GOOGLE_PASSWORD` | Пароль Google-акаунту |
| `PLAYWRIGHT_AUTH_STATE` | Вміст `playwright/.auth/user.json` |
