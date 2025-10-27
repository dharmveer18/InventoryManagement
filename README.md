# Inventory Management System

Full-stack RBAC inventory app with a React (Vite + TypeScript) frontend and a Django REST Framework backend.

- Frontend: `frontend/` — Vite + React 18, MUI, TanStack Query
- Backend: `backend/` — Django + DRF, JWT auth, OpenAPI
- Docs: `docs/ASSESSMENT.md` — approach, features, and roadmap

## Prerequisites

- Windows, macOS, or Linux
- Python 3.11+ and pip
- Node.js 18+ (v20 recommended) and npm
- Git
- Optional: Docker + Docker Compose
- Optional (for deployment): AWS account (ECS, S3/CloudFront)

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

## Local Setup


Open two terminals in the repo root.

Backend

```bash
# create and activate venv
python -m venv .venv
source .venv/Scripts/activate

# install deps and init DB
pip install -r backend/requirements.txt
python backend/manage.py migrate

# seed sample users/items (optional)
python backend/manage.py seed_users
python backend/manage.py seed_items

# run API at http://localhost:8000
python backend/manage.py runserver
```

Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env

# run web app at http://localhost:5173
npm run dev
```

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
- Launch type: EC2 (t3.micro) to stay Free‑Tier‑eligible
- Image source: GHCR or ECR
- Data: uses SQLite for demo; OK for evaluation only. For production, migrate to RDS Postgres.
- Zero‑downtime rollout: update service to new task definition; run `manage.py migrate` via a one‑off ECS task
- Networking options:
  - Option A — ALB: internet‑facing ALB → ECS service on port 8000 (simpler HTTPS via ACM). Slightly higher monthly cost.
  - Option B — No ALB (Service Discovery): expose container port 8000 on the ECS EC2 instance with a public Elastic IP. Register the ECS service in Cloud Map for internal DNS if needed. Use Route 53 A record to the Elastic IP (e.g., api.example.com). Cheapest, but you’ll need to handle TLS yourself (see HTTPS notes below).

Frontend: S3 static website hosting
- Build in CI and `aws s3 sync frontend/dist s3://$FRONTEND_BUCKET --delete`
- Optional: front with CloudFront for HTTPS and caching; invalidate on deploy
- Configure S3 bucket policy for static hosting or use CloudFront OAC for private buckets

Minimal AWS footprint to keep cost near zero:
- Use EC2 launch type on ECS with a Free‑Tier instance (t3.micro) and either ALB (Option A) or Elastic IP (Option B)
- Keep one environment (staging/preview via PR artifacts, prod via main)
- Turn off CloudFront initially if not needed; add later

HTTPS with Option B (no ALB):
- CloudFront: place CloudFront in front of the EC2 instance. Use an ACM cert on CloudFront, set the origin to the instance DNS:8000 (HTTP). Disable caching for `/api/*`, forward necessary headers/cookies for auth, and add a Route 53 CNAME to your CloudFront domain.
- API Gateway (HTTP API): create an HTTP API with a proxy integration to `http://<EC2_PUBLIC_DNS_OR_IP>:8000`. Attach a custom domain and ACM cert; configure CORS to allow your frontend domain (S3/CloudFront). Very low cost and avoids running TLS yourself.
  - In both cases, update DRF CORS/ALLOWED_HOSTS to include your domain and set `VITE_API_URL` to the CloudFront or API Gateway URL.
