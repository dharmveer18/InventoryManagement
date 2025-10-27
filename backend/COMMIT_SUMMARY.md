

Project Summary: Inventory Management Development

This document tracks the main goals and features added to the project over time.

Milestone History

M1: Core Foundation and Basic Inventory (Initial Commit)
Summary: Initial setup, secure login, and inventory endpoints.

M2: Schema Expansion, Audit & Reports
Summary:
- Expanded OpenAPI schema: added/updated endpoints, models, and enums
- Implemented audit logging (models, services, endpoints)
- Added report generation and tracking (models, endpoints)
- Improved serializers for new/changed models
- Enhanced API documentation and contract for frontend sync

M3: Deployment and Bulk Update
Summary:
- Added debug.log (temporary debugging file)
- Switched to ASGI with Uvicorn for deployment
- Added bulk update functionality
- Added unit test cases

M4: Audit API, inventory robustness, bulk stock improvements, and admin gating
Summary:
- Audit module API
	- Added read-only AuditLog endpoints (admin-only): serializers, viewset, router wiring under /api/audit-logs/
	- Safe on-commit audit facade (inventory/services/audit.py) used by ledger; respects AUDIT_ENABLED
- Inventory API enhancements
	- ItemSerializer enforces computed quantity as read-only; write uses category_id; returns nested category
	- ItemViewSet
		- adjust_stock action includes audit context (IP/User-Agent) and returns transaction
		- bulk_adjust_stock endpoint with per-row clamping to prevent negative stock and partial failures
		- Role- and model-perm based writes; managers limited, admins full edits; QuantityOnlySerializer for restricted updates
		- Pagination and schema annotations
	- CategoryViewSet: admin-only for create/update/delete
	- InventoryTransactionViewSet: admin-only listing/detail
	- Alert resolve action writes audit entry
	- URLs: category router basename fixed; endpoints grouped under /api/inventory/
- Ledger and services
	- apply_stock_delta now logs via audit facade; improved concurrency notes and state transitions
	- InsufficientStockError surfaced with user-friendly 400 response
- OpenAPI
	- Added InventoryManagementAPI.yaml snapshot covering inventory, users, audit, and auth endpoints
- Settings/Config
	- Logging initialization via basicConfig; added AUDIT_ENABLED toggle
	- Wired audit and users routes in config/urls.py; unified /api/ prefix
- Users API
	- Introduced dedicated UserSerializer; router registered at /api/users/
	- Added /api/users/me/ and admin-only set-role action
- Tests
	- API tests for item and category retrieval
	- Stock adjust tests for single and bulk endpoints, including invalid ID rollback and success paths
- Docs
	- README updated with seed commands for users/list
