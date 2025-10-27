# Inventory Management System

Full-stack RBAC inventory app with a React (Vite + TypeScript) frontend and a Django REST Framework backend.

- Frontend: `frontend/` — Vite + React 18, MUI, TanStack Query
- Backend: `backend/` — Django + DRF, JWT auth, OpenAPI
- Docs: `docs/ASSESSMENT.md` — approach, features, and roadmap

## Quickstart

Backend
- Python 3.11+
- Install deps and migrate:
  - `pip install -r backend/requirements.txt`
  - `python backend/manage.py migrate`
- Seed sample data (optional):
  - `python backend/manage.py seed_users`
  - `python backend/manage.py seed_list`
- Run dev server: `python backend/manage.py runserver`

Frontend
- Node 18+
- Install deps: `cd frontend && npm install`
- Start dev server: `npm run dev`

Open API docs at `http://localhost:8000/api/docs/` when the backend is running.

## Seeded users (for local testing)
Run `python backend/manage.py seed_users` to create these users with default passwords:

- admin.user / Admin@123 — role: admin
- manager.user / Manager@123 — role: manager
- basic.user1 / Basic@123 — role: viewer
- basic.user2 / Basic@123 — role: viewer

Tip: You can change passwords later in the Django admin at `http://localhost:8000/admin/`.

## Key features
- Role-based access (admin, manager, viewer)
- Inventory with append-only transaction ledger and computed quantity
- Adjust stock (single and bulk CSV)
- Low-stock alerts with resolve action
- Admin user management: assign roles
- OpenAPI schema exported under `backend/InventoryManagementAPI.yaml`

See `docs/ASSESSMENT.md` for detailed documentation and roadmap.

## CI/CD
- Continuous Delivery: in progress. This repo includes Dockerfiles and a docker-compose setup; pipeline wiring guidance below.

### Workflows

Backend (Django + DRF)
- Triggers: push to main, pull requests
- Steps:
  1. Set up Python (3.11)
  2. Install deps: `pip install -r backend/requirements.txt`
  3. Run tests: `python backend/manage.py test`
  4. Build Docker image: `docker build -t $IMAGE_TAG -f backend/DockerFile backend`
  5. Push image to registry (GHCR or AWS ECR)
  6. Deploy: update ECS service to new image and run DB migrations

Required secrets/vars (examples):
- GHCR or ECR auth (GHCR_TOKEN or AWS OIDC role), `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_REPOSITORY`
- ECS identifiers: `ECS_CLUSTER`, `ECS_SERVICE` (and `ECS_TASK_EXEC_ROLE` if creating infra)

Frontend (Vite + React)
- Triggers: push to main, pull requests
- Steps:
  1. Set up Node (18+)
  2. Install deps: `npm ci`
  3. Lint and test: `npm run lint`, `npm test`
  4. Build: `npm run build`
  5. Deploy: sync `frontend/dist/` to S3 and optionally invalidate CloudFront

Required secrets/vars (examples):
- AWS deploy role via OIDC, `AWS_REGION`, S3 bucket name `FRONTEND_BUCKET`, optional `CLOUDFRONT_DISTRIBUTION_ID`

Tip: Prefer GitHub OIDC to assume an AWS role instead of long-lived keys.

### Planned deployment

Backend: AWS ECS (cost‑conscious)
- Launch type: EC2 (t3.micro) to stay Free‑Tier‑eligible; single public service behind an ALB
- Image source: GHCR or ECR
- Data: uses SQLite for demo; OK for evaluation only. For production, migrate to RDS Postgres.
- Zero‑downtime rollout: update service to new task definition; run `manage.py migrate` via a one‑off ECS task
- Network: public ALB → ECS service on port 8000; security groups restrict inbound to HTTP/HTTPS

Frontend: S3 static website hosting
- Build in CI and `aws s3 sync frontend/dist s3://$FRONTEND_BUCKET --delete`
- Optional: front with CloudFront for HTTPS and caching; invalidate on deploy
- Configure S3 bucket policy for static hosting or use CloudFront OAC for private buckets

Minimal AWS footprint to keep cost near zero:
- Use EC2 launch type on ECS with a Free‑Tier instance (t3.micro) and a single ALB
- Keep one environment (staging/preview via PR artifacts, prod via main)
- Turn off CloudFront initially if not needed; add later
