# Inventory Management System — Assessment Documentation

## Overview

This project implements a role-based Inventory Management System with a React (Vite + TypeScript) frontend and a Django REST Framework backend. It addresses real-world needs for stock control, auditability, and administrative oversight while keeping the UX simple and responsive.

- Frontend: React 18, Vite, MUI, TanStack Query, Axios, Chart-ready structure
- Backend: Django + DRF, JWT auth, role-based permissions, audit logging, OpenAPI schema
- Data: SQLite for local dev (pluggable to Postgres/MySQL), normalized models with an append-only transaction ledger and a snapshot table for fast reads

This document explains the approach, what is built, and a roadmap to take it further.

## Key decisions

- Stock as a ledger: All quantity changes happen via explicit “adjustments” (append-only `InventoryTransaction` rows) to ensure auditability and enable trends. A snapshot table (`InventoryLevel`) stores current on-hand to avoid recomputing.
- Strict write contracts: Item updates require a normalized payload (`category_id`, price as string). Quantity
 is read-only; adjustments go through dedicated endpoints.
- RBAC in API and UI: Viewers can only read, Managers can adjust stock (and bulk CSV), Admins can edit items and manage users.
- Audit-first: A dedicated `audit` app and a safe logging facade ensure actions are recorded on-commit without breaking main flows.
- OpenAPI as a contract: The `InventoryManagementAPI.yaml` captures key endpoints for frontend generation and validation.

## Features completed

- Authentication & RBAC
  - JWT-based auth (cookie/bearer ready). Roles: admin, manager, viewer
  - View-level permissions enforce roles on inventory, users, alerts
- Inventory
  - Items and Categories CRUD (admins write; viewers read)
  - Quantity is computed from `InventoryLevel`; cannot be edited directly
  - Single-item adjust endpoint: `POST /api/inventory/items/{id}/adjust_stock/`
  - Bulk CSV adjust endpoint: `POST /api/inventory/items/bulk_adjust_stock/` (manager+)
    - Backend clamps negative deltas to prevent negative stock
- Alerts
  - Low-stock alert model and resolve action `POST /api/inventory/alerts/{id}/resolve/`
- Audit logging
  - Read-only `AuditLog` endpoints (admin-only)
  - On-commit audit write for stock adjustments (safe, non-blocking)
- Admin Users
  - List users (admin-only)
  - Assign roles via UI with staged edits and a single Assign action
- Frontend UX
  - Dashboard with DataGrid, Status chips (Low/Out), compact action controls
  - Unified item edit & adjust dialog (admins: fields + adjust, managers: adjust only)
  - Bulk CSV upload flow with dry-run/apply, parsing helpers, and tests
- API schema
  - `backend/InventoryManagementAPI.yaml` published via drf-spectacular

## Architecture

- Backend apps
  - `inventory`: Item, Category, InventoryTransaction, InventoryLevel, Alert; services (ledger, audit)
  - `users`: User API, set-role action, me endpoint
  - `audit`: AuditLog model exposure (read-only), serializers, viewset
- Frontend structure
  - Pages: Dashboard, Admin dashboard (Items, Users)
  - Components: InventoryTable, EditItemDialog, AdjustStockDialog/Fields, BulkStockCsvUpload/Dialog
  - Hooks: inventory CRUD + adjust, users list + set role, bulk stock mutation

## Data model (core)

- Item(id, name, category(FK), price(Decimal), low_stock_threshold)
- InventoryLevel(item OneToOne, quantity, updated_at)
- InventoryTransaction(id, item(FK), delta, reason, performed_by, created_at)
- Category(id, name)
- Alert(id, item(FK), type, message, triggered_at, resolved_at)
- User (Django auth with role field)

Rationale: Ledger + snapshot pattern provides both consistent audit/trend history and performant reads.

### Write/read optimization strategy

- Append-only events: For every stock change, we append one row to `InventoryTransaction` (write-optimized; sequential, small rows). No in-place mutation of historical data.
- Snapshot for reads: We update `InventoryLevel` (1:1 per item) to hold the current on-hand balance (read-optimized). Quantity lookups become a single indexed read.
- Event-based endpoints: Write endpoints accept an “adjustment” (event) and do not require clients to update multiple tables. The service layer records the event and maintains the snapshot atomically.
- Reduced joins in hot paths: Common reads (item list with quantity) avoid joins/aggregations; historical pages paginate transactions with minimal related prefetch (e.g., item/category names) as needed.

### Indexes (concise)

- InventoryLevel: unique index on `item_id` (OneToOne) for fast quantity lookups.
- InventoryTransaction: `(item_id, created_at)` for item history/trends; `(performed_by_id, created_at)` for audits by user.
- Items/Categories/Users: FK indexes by default; optional index on `role` if filtering users by role often.

## API highlights

Base prefix: `/api`

- Auth: `POST /api/token/`, `POST /api/token/refresh/`, `GET /api/users/me/`
- Users (admin): `GET /api/users/`, `POST /api/users/{id}/set-role/`
- Items: `GET /api/inventory/items/`, `POST`, `PUT/PATCH`, `DELETE` (admin)
- Adjust stock (manager+): `POST /api/inventory/items/{id}/adjust_stock/`
- Bulk adjust (manager+): `POST /api/inventory/items/bulk_adjust_stock/`
- Categories: `GET /api/inventory/categories/`, `POST/PUT/PATCH/DELETE` (admin)
- Alerts: `GET /api/inventory/alerts/`, resolve `POST /api/inventory/alerts/{id}/resolve/`
- Audit (admin): `GET /api/audit-logs/audit-logs/`, `GET /api/audit-logs/audit-logs/{id}/`

A full OpenAPI snapshot is available at `backend/InventoryManagementAPI.yaml`.

## Local setup

Prereqs: Node 18+, Python 3.11+, pip, virtualenv (optional)

Backend
- Create venv and install
  - `pip install -r backend/requirements.txt`
- Migrate DB
  - `python backend/manage.py migrate`
- Seed sample data (optional helper commands present)
  - `python backend/manage.py seed_users`
  - `python backend/manage.py seed_list`
- Run dev server
  - `python backend/manage.py runserver` (ASGI-ready; can run with uvicorn in prod)

Frontend
- Install
  - `cd frontend && npm install`
- Run
  - `npm run dev`

Tests
- Backend: `python backend/manage.py test inventory`
- Frontend: `cd frontend && npm test`

## Deployment notes

- ASGI: Backend is ASGI-ready; use Uvicorn/Gunicorn with workers. Static/media via CDN or reverse proxy.
- Containers: Dockerfiles are present; compose can be extended with Postgres and Redis for production.
- OpenAPI: Serve schema at `/api/schema/` with Swagger UI at `/api/docs/`.

## How the solution meets the task spec

- RBAC: Admin/Manager/Viewer enforced server-side; UI adapts actions accordingly
- Audit logs: All stock changes logged; admin can view audit list
- Bulk CSV: Managers can upload CSV to adjust stock; frontend validates and shows results
- Low-stock alerts: Auto-created on threshold breach; resolve endpoint present
- Admin reports: Report models are scaffolded (`reports` app). API generation and scheduling are on the roadmap (see below).

## Reporting

Current status
- Models are scaffolded in `backend/reports/models.py`:
  - `ReportDefinition` catalogs report types, format (csv/pdf/json), and a JSON `config` for schema/parameters.
  - `ReportRun` tracks each execution with parameters, status (queued/running/success/failed), timing, and error message.
  - `ReportArtifact` persists generated files with metadata (content_type, size, checksum) linked to the run.

Execution flow
1) Client calls `POST /api/reports/runs/` — server validates parameters against `ReportDefinition.config.schema` (JSON Schema).
2) A `ReportRun` is created with status `queued` and a Celery task is enqueued; task_id is stored on the run.
3) Worker sets status `running`, generates the report, saves a `ReportArtifact` (via `FileField`), computes SHA-256 checksum and size, then marks status `success` (or `failed` with `error_message`).
4) write an audit log with action `REPORT_GENERATE` including who requested and which parameters.

Permissions
- Default to admin-only runs; optionally add a per-definition visibility/permissions model (e.g., `allowed_roles` on `ReportDefinition`).

Frontend UI
- Reports page: list definitions, show a dynamic parameters form based on JSON Schema, trigger run, poll run status, and display downloadable artifacts.
- For monthly inventory, a simple date picker (month/year) with a “Generate” button; runs table with status chips.

Error handling
- Failed runs keep `error_message`. The UI surfaces errors and allows retry. Backend logs are correlated via task_id.

Next steps to implement
- DRF serializers and viewsets for `ReportDefinition`, `ReportRun`, and a download view for `ReportArtifact`.
- Celery worker and task wiring; S3 storage config (optional initially).
- Minimal React page to trigger a monthly report and list artifacts; add links in Admin navigation.

## Roadmap (next iterations)

Short-term
- Reports
  - Implement `ReportDefinition` registry and `ReportRun` endpoints
  - Async generation via Celery + Redis; store `ReportArtifact` via `FileField` / S3 (django-storages)
  - Admin endpoint: `POST /api/reports/monthly?month=YYYY-MM` to enqueue, then poll status
- Trends & charts
  - `GET /api/trends/items/{id}` aggregating `InventoryTransaction` by day
  - Frontend Chart.js line chart with moving average
- Email/push notifications
  - Low-stock alerts via SMTP (Django email backend) or push (web push service)

Hardening & UX
- Server-side validation with JSON Schema for report params
- Better pagination/filters on items/alerts/audit
- Success toasts and optimistic UI for role changes
- E2E tests (Playwright/Cypress)

Architecture & data access
- Introduce a Repository layer between the Service layer and the ORM to add a protection boundary and centralize data access
  - Example: `InventoryRepository` (and peers) exposing vetted methods like `get_item_with_level(id)`, `adjust_stock_txn(...)`, `list_low_stock(limit)`
  - Enforce invariants and transaction scopes (begin/commit/rollback) inside repository methods
  - Encapsulate query shapes and prevent accidental N+1s; enable read/write segregation later if needed
  - Improves testability (mock repositories) and isolates ORM/DB changes from services

Ops
- Switch DB to Postgres; add migrations & seed scripts
- Add Redis for Celery broker/backend; add Celery Beat for schedules (monthly reports)
- CI pipeline for lint/test/build; container images pushed to registry

## Submission

- Source code: this repository includes frontend and backend
- Run instructions: see sections above and service-level READMEs
- Documentation: this assessment doc and commit summaries; OpenAPI spec under `backend/`
