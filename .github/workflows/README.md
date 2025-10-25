# CI/CD Configuration

This directory contains GitHub Actions workflows for the Inventory Management project.

## Workflows

### Backend CI/CD (`backend.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **Test** - Runs on all triggers
   - Sets up Python 3.12
   - Installs dependencies from `backend/requirements.txt`
   - Runs database migrations
   - Executes Django tests

2. **Build & Push** - Only on push to `main`
   - Builds Docker image from `backend/Dockerfile`
   - Pushes to GitHub Container Registry (GHCR) as `ghcr.io/dharmveer18/inventorymanagement-backend`
   - Tags: `latest` and `sha-<commit-hash>`

3. **Deploy** - Only on push to `main` (requires production environment)
   - Deploys to production server via SSH
   - Pulls latest Docker image
   - Runs database migrations in container
   - Restarts backend service

**Required Secrets:**
- `SSH_HOST_PRODUCTION` - Production server hostname/IP
- `SSH_USER_PRODUCTION` - SSH username
- `SSH_KEY_PRODUCTION` - SSH private key
- `GITHUB_TOKEN` - Auto-provided by GitHub

### Frontend CI/CD (`frontend.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **Test** - Runs on all triggers
   - Sets up Node.js 20
   - Installs dependencies with `npm ci`
   - Runs ESLint
   - Builds production bundle with Vite
   - Uploads build artifacts

2. **Build & Push** - Only on push to `main`
   - Builds Docker image from `frontend/Dockerfile` (multi-stage with Nginx)
   - Pushes to GitHub Container Registry (GHCR) as `ghcr.io/dharmveer18/inventorymanagement-frontend`
   - Tags: `latest` and `sha-<commit-hash>`

3. **Deploy** - Only on push to `main` (requires production environment)
   - Deploys to production server via SSH
   - Pulls latest Docker image
   - Restarts frontend service

**Required Secrets:**
- `SSH_HOST_PRODUCTION` - Production server hostname/IP
- `SSH_USER_PRODUCTION` - SSH username
- `SSH_KEY_PRODUCTION` - SSH private key
- `GITHUB_TOKEN` - Auto-provided by GitHub

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Access:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:80
```

## Production Deployment

### Prerequisites

1. **GitHub Secrets Configuration:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add the required secrets listed above

2. **Production Server Setup:**
   - Docker and Docker Compose installed
   - SSH access configured
   - Directory `/opt/stack/production/` created
   - Production `docker-compose.yml` configured at `/opt/stack/production/docker-compose.yml`

3. **GitHub Container Registry:**
   - Images are automatically pushed to GHCR on push to `main`
   - Images are public by default, configure in package settings if needed

### Deployment Flow

1. Push code to `main` branch
2. CI tests run automatically
3. If tests pass, Docker images are built and pushed to GHCR
4. Deployment SSH into production server
5. Pull latest images and restart services
6. Backend migrations run automatically

## Monitoring & Debugging

### View Workflow Runs
- Go to repository → Actions tab
- Click on a specific workflow run to see details
- Download artifacts for debugging (frontend build artifacts available for 7 days)

### Common Issues

**Backend tests fail:**
- Check migrations are up to date
- Verify all dependencies are in `requirements.txt`

**Frontend build fails:**
- Check `package-lock.json` is committed
- Verify all imports resolve correctly
- ESLint errors must be fixed

**Docker build fails:**
- Verify Dockerfile syntax
- Check all required files are present
- Ensure base images are accessible

**Deployment fails:**
- Verify SSH credentials are correct
- Check production server has Docker installed
- Ensure `/opt/stack/production/docker-compose.yml` exists

## Cache Configuration

Both workflows use caching to speed up builds:
- **Backend:** Pip packages cached by hash of `requirements.txt`
- **Frontend:** npm packages cached by hash of `package-lock.json`
- **Docker:** Layer caching using GitHub Actions cache

## Security

- All secrets are stored in GitHub Secrets (encrypted)
- Docker images can be scanned with security tools
- SSH deployments use key-based authentication
- Production environment protection can be enabled in repository settings
