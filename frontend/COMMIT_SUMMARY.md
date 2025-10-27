Project Summary: Inventory Management Frontend Development

This document tracks the main goals and features added to the frontend over time.

Milestone History

M1: SPA foundation and auth scaffolding
Summary:
- Vite + React + TypeScript project scaffolded
- Basic routing and auth context/guards wired

M2: Dashboard and inventory CRUD baseline
Summary:
- Initial dashboard views and inventory listing
- Basic dialogs and hooks for items/categories

M3: Deployment alignment and Bulk Stock CSV upload
Summary:
- SPA entry fix to load /src/main.tsx from index.html
- Bulk CSV workflow for stock adjustments
	- Components: BulkStockCsvUpload, BulkStockCsvDialog
	- Sample CSV added at public/samples/bulk_stock_seed_sample.csv
	- Utils for parsing numeric deltas safely (src/utils/csv.ts)
	- Post to backend POST /inventory/items/bulk_adjust_stock/
	- Tests with Vitest/JSDOM; papaparse mocked for deterministic runs
	- Vitest config updated to use vitest/config; setup file hookable
	- Ambient types for papaparse (src/types/external/papaparse.d.ts)
- UI building blocks: TopBar, SideNav, SummaryCards

M4: Admin UX, inventory workflow unification, payload hardening, and stability
Summary:
- Admin dashboard and role management
	- AdminDashboard with Items and Users tabs behind RoleGate min=admin
	- Users tab uses useUsersList (supports paginated and array responses)
	- Role changes staged locally with an Assign button; apply on click only
	- Inline error display and “Saving…” helper text per-row
	- useSetUserRole posts to /users/{id}/set-role/
- Inventory UX refinements
	- Unified EditItemDialog with inline AdjustStockFields; managers adjust only, admins can edit fields
	- Reusable AdjustStockDialog and AdjustStockFields components
	- InventoryTable columns split: Adjust, Edit, Delete; new Status column (Low/Out)
	- Category name valueGetter compatible with DataGrid v8; compact button styling
- Data contracts and services
	- buildItemWritePayload enforces strict write shape (category_id, price as string, threshold)
	- Hooks updated to use payload builder for add/update; adjust posts to detail adjust_stock
	- contracts.ts refined for generated OpenAPI types
- Testing and configuration
	- Vitest config migrated to vitest/config
	- Added csv utils tests; bulk upload component tests (mocked parsing)
- Refactor
	- columns.ts shim to re-export TSX to keep types clean
	- Layout scaffolding for dashboard pages



Frontend Development Summary

This document tracks the technology stack and major feature milestones for the client-side SPA.

Milestone History

M1: Core UI Screens (Initial Commit)
Summary: Initial login and inventory views.

M2: API Contract, Audit & Reports Integration
Summary:
- Synced with updated backend OpenAPI schema (new endpoints, models, and enums)
- Regenerated TypeScript types (openapi.d.ts) for new/changed API contract
- Refactored API client and hooks to use new types and endpoints
- Added UI and logic for audit logs and report features
- Improved error handling and type safety across new and existing API calls