# Tests + GitHub Actions CI — Design Spec

**Date:** 2026-05-27  
**Scope:** employes_backend (Go) + employes_frontend (Next.js 14)  
**Trigger:** any push to any branch

---

## Goals

- Backend: unit tests covering HTTP handlers with mocked DB (no real MySQL in CI)
- Frontend: unit tests covering pure functions in `lib/`
- CI: single GitHub Actions workflow, two parallel jobs, fails fast

## Files to Create

```
.github/workflows/ci.yml

employes_backend/
  handlers/employees_test.go
  handlers/common_test.go
  router_test.go

employes_frontend/
  lib/dates.test.ts
  lib/schemas.test.ts
  jest.config.js
  jest.setup.ts
```

## Backend Tests (Go)

**New dependency:** `github.com/DATA-DOG/go-sqlmock v1`

### `handlers/employees_test.go`
Uses `net/http/httptest` + `go-sqlmock`. Each test:
1. Creates mock DB with expected query + rows
2. Creates handler with mock DB
3. Sends HTTP request via `httptest.NewRecorder`
4. Asserts status code and response JSON

Cases:
- `GET /api/v1/employees` → 200 + list of employees
- `GET /api/v1/employees/10001` → 200 + single employee
- `GET /api/v1/employees/abc` → 400 invalid ID
- `GET /api/v1/employees/99999` → 404 not found
- `POST /api/v1/employees` → 201 + created employee
- `POST /api/v1/employees` with bad JSON → 400
- `PUT /api/v1/employees/10001` → 200 + updated employee
- `PUT /api/v1/employees/` (no ID) → 400
- `DELETE /api/v1/employees/10001` → 200 deleted
- `DELETE /api/v1/employees/99999` → 404 not found
- `PATCH /api/v1/employees` → 405 method not allowed

### `handlers/common_test.go`
- `WriteJSON` sets `Content-Type: application/json`
- `WriteJSON` writes correct status code
- `WriteJSON` encodes struct to JSON body

### `router_test.go`
- `GET /health` with healthy DB → 200
- `GET /health` with failing DB → 500
- CORS middleware sets `Access-Control-Allow-Origin` header
- `OPTIONS` preflight → 204

## Frontend Tests (Jest + ts-jest)

**New dev dependencies:** `jest`, `ts-jest`, `@types/jest`

### `lib/dates.test.ts`
- `toRFC3339("2024-01-15")` → `"2024-01-15T00:00:00Z"`
- `toRFC3339("")` → `""`
- `toInputDate("2024-01-15T00:00:00Z")` → `"2024-01-15"`
- `toInputDate("")` → `""`

### `lib/schemas.test.ts`
Per schema: one valid parse test + at least one invalid parse test.

- `employeeSchema` valid → passes, transforms dates to RFC3339
- `employeeSchema` missing `first_name` → ZodError
- `employeeSchema` `gender: "X"` → ZodError
- `departmentSchema` valid → passes
- `departmentSchema` empty `dept_no` → ZodError
- `salarySchema` valid → transforms string numbers to Number
- `countrySchema` `iso` > 2 chars → ZodError
- `regionSchema` valid → `country` transformed to Number

## GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`  
**Trigger:** `push` to any branch (`branches: ['**']`)  
**Jobs:** `test-backend` and `test-frontend` run in parallel

```yaml
test-backend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v5
      with: { go-version: '1.21' }
    - run: go mod tidy
      working-directory: employes_backend
    - run: go test ./...
      working-directory: employes_backend

test-frontend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - run: npm ci
      working-directory: employes_frontend
    - run: npm test -- --passWithNoTests
      working-directory: employes_frontend
```

## Out of Scope

- Integration tests with real MySQL
- React component tests (RTL)
- E2E tests (Playwright/Cypress)
- Test coverage thresholds
