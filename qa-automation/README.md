QA Automation scaffold for WC_repo

Structure:
/qa-automation
  /unit
  /integration
  /e2e
  /database
  /reports
  /coverage

How to run frontend tests (from project root of frontend):

1. Install dev dependencies

```bash
cd Frontend/mundial-app
npm install
```

2. Run unit tests

```bash
npm test
```

Notes:
- Frontend uses Jest + ts-jest + React Testing Library for unit tests.
- E2E recommended tool: Playwright (not yet configured).
- Database tests: use Testcontainers or dedicated Docker Postgres and run integration tests from backend.

CI snippet (GitHub Actions) suggestion:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install frontend deps
        run: |
          cd Frontend/mundial-app
          npm ci
      - name: Run tests
        run: |
          npm test
``` 
