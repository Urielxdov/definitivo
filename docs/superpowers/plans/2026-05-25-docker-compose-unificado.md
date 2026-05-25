# Docker Compose Unificado + Frontend ↔ Backend Alignment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify both projects in a single root docker-compose, fix all missing frontend types/schemas, and wire API proxy so browser ↔ Next.js ↔ Go backend works without hardcoded URLs or CORS issues.

**Architecture:** Next.js rewrites proxy `/api/*` server-side to the Go backend via internal Docker network. Browser only talks to port 3000 (frontend). MySQL init scripts load via `docker-entrypoint-initdb.d`. Raw SQL kept in backend (no ORM).

**Tech Stack:** Go 1.21, `database/sql` + `go-sql-driver/mysql`, Next.js 14, React 18, TailwindCSS, TanStack Query, react-hook-form, zod, Docker Compose v3.8, MySQL 8.0, Node 20 Alpine.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `centralizado/docker-compose.yml` | Create | 3 services: mysql, api, frontend |
| `employes_frontend/Dockerfile` | Create | Multi-stage Next.js build |
| `employes_frontend/next.config.js` | Modify | Add rewrites to proxy `/api/*` → backend |
| `employes_frontend/app/api/client.ts` | Modify | Use relative URL `/api/v1` |
| `employes_frontend/types/index.ts` | Modify | Add 5 missing types + expand EntityType |
| `employes_frontend/lib/schemas.ts` | Modify | Add 5 missing Zod schemas |
| `employes_frontend/components/Tabs.tsx` | Modify | Add 5 missing tabs |
| `employes_frontend/components/EntityList.tsx` | Modify | Add 5 missing ID_FIELD entries |

---

### Task 1: Root docker-compose.yml

**Files:**
- Create: `centralizado/docker-compose.yml`

- [ ] **Step 1: Create root docker-compose.yml**

File: `/home/uhernand/centralizado/docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: employees-db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: employees
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./employes_backend/mysql-employees-master:/docker-entrypoint-initdb.d
    working_dir: /docker-entrypoint-initdb.d
    networks:
      - employees-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./employes_backend
    container_name: employees-api
    environment:
      DB_HOST: mysql
      DB_PORT: "3306"
      DB_USER: root
      DB_PASS: root_password
      API_PORT: "8080"
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - employees-net
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 10s
      timeout: 3s
      retries: 10

  frontend:
    build: ./employes_frontend
    container_name: employees-frontend
    environment:
      API_INTERNAL_URL: http://api:8080
    ports:
      - "3000:3000"
    depends_on:
      api:
        condition: service_healthy
    networks:
      - employees-net

volumes:
  mysql_data:

networks:
  employees-net:
    driver: bridge
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la /home/uhernand/centralizado/docker-compose.yml
```

Expected: file listed with size > 0.

---

### Task 2: Frontend Dockerfile

**Files:**
- Create: `employes_frontend/Dockerfile`

- [ ] **Step 1: Create Dockerfile**

File: `/home/uhernand/centralizado/employes_frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la /home/uhernand/centralizado/employes_frontend/Dockerfile
```

Expected: file listed with size > 0.

---

### Task 3: Next.js API proxy (rewrites)

**Files:**
- Modify: `employes_frontend/next.config.js`

Context: `API_INTERNAL_URL` is a server-side env var (no `NEXT_PUBLIC_` prefix). It is read by the Next.js server at startup — not baked at build time. In Docker it equals `http://api:8080`. In local dev it defaults to `http://localhost:8080`.

- [ ] **Step 1: Update next.config.js with rewrites**

File: `/home/uhernand/centralizado/employes_frontend/next.config.js`

Replace entire file with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_INTERNAL_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Verify syntax**

```bash
node -e "require('/home/uhernand/centralizado/employes_frontend/next.config.js')" && echo "OK"
```

Expected: `OK`

---

### Task 4: Fix hardcoded API URL in client.ts

**Files:**
- Modify: `employes_frontend/app/api/client.ts:3`

- [ ] **Step 1: Change API_BASE_URL to relative path**

In `/home/uhernand/centralizado/employes_frontend/app/api/client.ts`, replace:

```ts
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

With:

```ts
const API_BASE_URL = '/api/v1';
```

- [ ] **Step 2: Commit tasks 1–4**

The root `centralizado/` dir has no git repo yet. Init one, then commit all infrastructure files together:

```bash
cd /home/uhernand/centralizado
git init
git add docker-compose.yml docs/
git commit -m "feat: add root docker-compose and plan docs"
```

Commit frontend files in its own repo:

```bash
cd /home/uhernand/centralizado/employes_frontend
git add Dockerfile next.config.js app/api/client.ts
git commit -m "feat: add Dockerfile and API proxy rewrite, fix hardcoded backend URL"
```

---

### Task 5: Add missing TypeScript types

**Files:**
- Modify: `employes_frontend/types/index.ts`

The backend exposes 11 entities. The frontend currently only has 6. Add the 5 missing ones and expand `EntityType`.

- [ ] **Step 1: Replace types/index.ts**

File: `/home/uhernand/centralizado/employes_frontend/types/index.ts`

Replace entire file with:

```ts
export interface Employee {
  emp_no: number;
  employee_id: string;
  date_of_birth: string;
  first_name: string;
  last_name: string;
  middle_names: string;
  gender: string;
  date_of_hiring: string;
  date_of_termination: string;
  date_of_probation_end: string;
}

export interface Department {
  dept_no: string;
  dept_name: string;
}

export interface Salary {
  emp_no: number;
  salary: number;
  from_date: string;
  to_date: string;
}

export interface Title {
  emp_no: number;
  title: string;
  from_date: string;
  to_date: string;
}

export interface DeptEmp {
  emp_no: number;
  dept_no: string;
  from_date: string;
  to_date: string;
}

export interface DeptManager {
  emp_no: number;
  dept_no: string;
  from_date: string;
  to_date: string;
}

export interface SalaryGroup {
  sg_no: number;
  sg_name: string;
  base_salary: number;
  from_date: string;
  to_date: string;
}

export interface SgEmp {
  emp_no: number;
  sg_no: number;
  from_date: string;
  to_date: string;
}

export interface Country {
  id: number;
  iso: string;
  name: string;
  nicename: string;
  iso3: string | null;
  numcode: number | null;
  phonecode: number;
}

export interface Region {
  id: number;
  name: string;
  nicename: string;
  note: string;
  country: number;
}

export interface RegionEmp {
  emp_no: number;
  region_id: number;
  from_date: string;
  to_date: string;
}

export type EntityType =
  | 'employees'
  | 'departments'
  | 'salaries'
  | 'titles'
  | 'dept_emp'
  | 'dept_manager'
  | 'salary_groups'
  | 'sg_emp'
  | 'countries'
  | 'regions'
  | 'region_emp';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/uhernand/centralizado/employes_frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing ones unrelated to types/index.ts).

---

### Task 6: Add missing Zod schemas

**Files:**
- Modify: `employes_frontend/lib/schemas.ts`

- [ ] **Step 1: Replace lib/schemas.ts**

File: `/home/uhernand/centralizado/employes_frontend/lib/schemas.ts`

Replace entire file with:

```ts
import { z } from 'zod';
import { toRFC3339 } from './dates';

const dateField = z
  .string()
  .refine(d => !isNaN(Date.parse(d)), 'Invalid date')
  .transform(toRFC3339);

export const employeeSchema = z.object({
  employee_id: z.string().default(''),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  middle_names: z.string().default(''),
  gender: z.enum(['D', 'M', 'F'], { message: 'Must be D, M or F' }),
  date_of_birth: dateField,
  date_of_hiring: dateField,
  date_of_termination: z.string().optional().default('').transform(d => d ? toRFC3339(d) : '2222-01-01T00:00:00Z'),
  date_of_probation_end: z.string().optional().default('').transform(d => d ? toRFC3339(d) : '1920-07-01T00:00:00Z'),
});

export const departmentSchema = z.object({
  dept_no: z.string().min(1, 'Required'),
  dept_name: z.string().min(1, 'Required'),
});

export const salarySchema = z.object({
  emp_no: z.string().transform(Number),
  salary: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const titleSchema = z.object({
  emp_no: z.string().transform(Number),
  title: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const deptEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  dept_no: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const deptManagerSchema = z.object({
  emp_no: z.string().transform(Number),
  dept_no: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const salaryGroupSchema = z.object({
  sg_name: z.string().min(1, 'Required'),
  base_salary: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const sgEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  sg_no: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const countrySchema = z.object({
  iso: z.string().min(1, 'Required').max(2, 'Max 2 chars'),
  name: z.string().min(1, 'Required'),
  nicename: z.string().min(1, 'Required'),
  iso3: z.string().max(3).optional().default(''),
  numcode: z.string().optional().default('').transform(v => v ? Number(v) : null),
  phonecode: z.string().transform(Number),
});

export const regionSchema = z.object({
  name: z.string().min(1, 'Required'),
  nicename: z.string().min(1, 'Required'),
  note: z.string().default(''),
  country: z.string().transform(Number),
});

export const regionEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  region_id: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const schemas: Record<string, z.ZodObject<any>> = {
  employees: employeeSchema,
  departments: departmentSchema,
  salaries: salarySchema,
  titles: titleSchema,
  dept_emp: deptEmpSchema,
  dept_manager: deptManagerSchema,
  salary_groups: salaryGroupSchema,
  sg_emp: sgEmpSchema,
  countries: countrySchema,
  regions: regionSchema,
  region_emp: regionEmpSchema,
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/uhernand/centralizado/employes_frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

---

### Task 7: Add missing tabs to Tabs component

**Files:**
- Modify: `employes_frontend/components/Tabs.tsx`

- [ ] **Step 1: Update ENTITIES array in Tabs.tsx**

In `/home/uhernand/centralizado/employes_frontend/components/Tabs.tsx`, replace:

```ts
const ENTITIES: { label: string; value: EntityType }[] = [
  { label: 'Employees', value: 'employees' },
  { label: 'Departments', value: 'departments' },
  { label: 'Salaries', value: 'salaries' },
  { label: 'Titles', value: 'titles' },
  { label: 'Dept Assignments', value: 'dept_emp' },
  { label: 'Managers', value: 'dept_manager' },
];
```

With:

```ts
const ENTITIES: { label: string; value: EntityType }[] = [
  { label: 'Employees', value: 'employees' },
  { label: 'Departments', value: 'departments' },
  { label: 'Salaries', value: 'salaries' },
  { label: 'Titles', value: 'titles' },
  { label: 'Dept Assignments', value: 'dept_emp' },
  { label: 'Managers', value: 'dept_manager' },
  { label: 'Salary Groups', value: 'salary_groups' },
  { label: 'SG Assignments', value: 'sg_emp' },
  { label: 'Countries', value: 'countries' },
  { label: 'Regions', value: 'regions' },
  { label: 'Region Assignments', value: 'region_emp' },
];
```

---

### Task 8: Add missing ID_FIELD entries to EntityList

**Files:**
- Modify: `employes_frontend/components/EntityList.tsx:7-14`

The `ID_FIELD` map tells the component which field is the primary identifier for each entity (used as React key and for edit/delete routing).

- [ ] **Step 1: Update ID_FIELD in EntityList.tsx**

In `/home/uhernand/centralizado/employes_frontend/components/EntityList.tsx`, replace:

```ts
const ID_FIELD: Record<EntityType, string> = {
  employees: 'emp_no',
  departments: 'dept_no',
  salaries: 'emp_no',
  titles: 'emp_no',
  dept_emp: 'emp_no',
  dept_manager: 'emp_no',
};
```

With:

```ts
const ID_FIELD: Record<EntityType, string> = {
  employees: 'emp_no',
  departments: 'dept_no',
  salaries: 'emp_no',
  titles: 'emp_no',
  dept_emp: 'emp_no',
  dept_manager: 'emp_no',
  salary_groups: 'sg_no',
  sg_emp: 'emp_no',
  countries: 'id',
  regions: 'id',
  region_emp: 'emp_no',
};
```

- [ ] **Step 2: Verify TypeScript compiles clean**

```bash
cd /home/uhernand/centralizado/employes_frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit tasks 5–8**

```bash
cd /home/uhernand/centralizado/employes_frontend
git add types/index.ts lib/schemas.ts components/Tabs.tsx components/EntityList.tsx
git commit -m "feat: align frontend with all 11 backend routes — types, schemas, tabs, ID fields"
```

---

### Task 9: Build and smoke-test

- [ ] **Step 1: Build and start all services**

```bash
cd /home/uhernand/centralizado
docker compose up --build -d
```

Expected: all 3 services start. MySQL init may take 1–2 minutes on first run (loading dump files).

- [ ] **Step 2: Wait for healthy state**

```bash
docker compose ps
```

Expected: `employees-db`, `employees-api`, `employees-frontend` all showing `healthy` or `running`.

- [ ] **Step 3: Verify backend health**

```bash
curl -s http://localhost:8080/health | python3 -m json.tool
```

Expected:
```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

- [ ] **Step 4: Verify frontend proxies to backend**

```bash
curl -s http://localhost:3000/api/v1/employees | python3 -m json.tool | head -20
```

Expected: `{"success": true, "data": [...]}` — list of employees from MySQL.

- [ ] **Step 5: Verify all 11 entity routes via proxy**

```bash
for entity in employees departments salaries titles dept_emp dept_manager salary_groups sg_emp countries regions region_emp; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/$entity)
  echo "$entity → $status"
done
```

Expected: all return `200`.

- [ ] **Step 6: Open browser**

Navigate to `http://localhost:3000`. Verify:
- All 11 tabs appear in the navigation
- Each tab loads data without errors
- No CORS errors in browser console

- [ ] **Step 7: Final commit (if any files unstaged)**

```bash
cd /home/uhernand/centralizado
git status
# commit any remaining untracked files if needed
```
