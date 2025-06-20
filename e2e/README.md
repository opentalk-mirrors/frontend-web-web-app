# E2E Tests

This project can run several end2end tests against different instances with different user

## How to run local

1. run ```npx playwright install```
2. run ```pnpm install```
3. create `.env` file in the `e2e` directory
4. fill in your variables (look at `.env-example` or in the table)
5. run ```pnpm playwright test```

Have a look in to the [Commands](#commands) section

## Writing Tests

- for local testing, create an .env file like the .env-example and fill it with your data
- tests will be created in the `tests` folder
- separate tests in different file depending on what should be tested
- keep tests clean and simple

## Environment Variables

| Variable Name         | Required | Default       | Description                                          |
| --------------------- | -------- | ------------- | -----------------------------------------------------|
| INSTANCE_URL          | yes      |               | The instance Baseurl against the tests should be run |
| USERNAME              | yes      |               | Username for login                                   |
| USER_EMAIL            | yes      |               | Email for login                                      |
| PASSWORD              | yes      |               | Password for login                                   |
| ALL_TESTS             | no       | false         | Per default just smoke tests are running, if all tests should run set this variable to `true` |

## Commands

Inside that directory, you can run several commands:

Run the end-to-end test

```bash
pnpm playwright test
```

Starts the interactive UI mode.

```bash
pnpm playwright test --ui
```

Runs the tests only on Desktop Chrome.

```bash
pnpm playwright test --project=chromium
```

Runs the tests in a specific file.

```bash
pnpm playwright test example
```

Runs the tests in debug mode.

```bash
pnpm playwright test --debug
```

Auto generate tests with Codegen.

```bash
pnpm playwright codegen
```

We suggest that you begin by typing:

```bash
pnpm playwright test
```
