# Deployment Guide

This document explains the CI/CD pipeline and deployment configuration for the Inventory Management System.

## Overview

The application uses a GitHub Actions-based CI/CD pipeline that automatically builds, tests, and deploys both the backend (Django) and frontend (React) components.

## Deployment Architecture

### Backend Deployment

The backend Django application is deployed as a Docker container to a production server via SSH.

**Deployment Flow:**
1. **CI (Continuous Integration)**: Tests run on every push and pull request
2. **Build & Push**: Docker images are built and pushed to GitHub Container Registry (GHCR)
3. **Deploy**: Application is deployed to a production server via SSH

**Deployment Target:**
- **Container Registry**: GitHub Container Registry (ghcr.io)
- **Image Name**: `ghcr.io/dharmveer18/inventorymanagement-backend`
- **Production Server**: Remote server accessed via SSH (configured through GitHub Secrets)
- **Deployment Path**: `/opt/stack/production/` (on the production server)
- **Orchestration**: Docker Compose

### Frontend Deployment

The frontend React application deployment configuration is currently pending.

## Required GitHub Secrets

To enable deployment, the following secrets must be configured in the GitHub repository settings:

### Backend Deployment Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `SSH_HOST_PRODUCTION` | Production server hostname or IP address | `example.com` or `192.168.1.100` |
| `SSH_USER_PRODUCTION` | SSH username for deployment | `deploy` or `ubuntu` |
| `SSH_KEY_PRODUCTION` | Private SSH key for authentication | `-----BEGIN RSA PRIVATE KEY-----...` |

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions and does not need to be configured.

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each of the required secrets listed above

## Production Server Setup

Your production server needs to have the following prerequisites:

### Prerequisites

1. **Docker & Docker Compose**: Installed and running
2. **SSH Access**: Configured to accept connections from GitHub Actions
3. **Directory Structure**: Create the deployment directory:
   ```bash
   sudo mkdir -p /opt/stack/production
   ```

4. **Docker Compose Configuration**: Create a `docker-compose.yml` file at `/opt/stack/production/docker-compose.yml`:
   ```yaml
   version: '3.8'
   
   services:
     backend:
       image: ghcr.io/dharmveer18/inventorymanagement-backend:latest
       container_name: inventory-backend
       ports:
         - "8000:8000"
       environment:
         - DEBUG=False
         - DJANGO_SETTINGS_MODULE=config.settings
         - SECRET_KEY=${SECRET_KEY}
         - ALLOWED_HOSTS=${ALLOWED_HOSTS}
         - DATABASE_URL=${DATABASE_URL}
       volumes:
         - ./data:/app/data
         - ./static:/app/static
       restart: unless-stopped
   ```

5. **Environment Variables**: Create a `.env` file in `/opt/stack/production/` with your production settings:
   ```env
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   DATABASE_URL=sqlite:///data/db.sqlite3
   ```

### SSH Key Setup

1. Generate an SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy
   ```

2. Add the public key to your server's `~/.ssh/authorized_keys`:
   ```bash
   cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
   ```

3. Copy the private key and add it to GitHub Secrets as `SSH_KEY_PRODUCTION`:
   ```bash
   cat ~/.ssh/github_deploy
   ```

## Deployment Process

### Automatic Deployment

When code is pushed to the `main` branch:

1. **Tests Run**: Django tests execute to ensure code quality
2. **Docker Build**: A new Docker image is built with the commit SHA as a tag
3. **Push to Registry**: Image is pushed to GitHub Container Registry
4. **Deploy to Production**:
   - SSH connection is established to the production server
   - Latest Docker image is pulled from GHCR
   - Docker Compose updates the running container
   - Database migrations are run automatically
   - Old Docker images are cleaned up

### Manual Deployment

If you need to manually deploy or rollback:

1. **SSH into your production server**:
   ```bash
   ssh user@your-server.com
   ```

2. **Navigate to the deployment directory**:
   ```bash
   cd /opt/stack/production
   ```

3. **Pull and deploy a specific version**:
   ```bash
   docker pull ghcr.io/dharmveer18/inventorymanagement-backend:sha-<commit-sha>
   docker compose up -d backend
   ```

4. **Run migrations**:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

## Monitoring and Logs

### View Application Logs

```bash
# On production server
cd /opt/stack/production
docker compose logs -f backend
```

### Check Container Status

```bash
docker compose ps
```

### Access Container Shell

```bash
docker compose exec backend bash
```

## Rollback Procedure

If a deployment causes issues:

1. **Find the previous working commit SHA** from GitHub or git history

2. **Deploy the previous version**:
   ```bash
   cd /opt/stack/production
   docker pull ghcr.io/dharmveer18/inventorymanagement-backend:sha-<previous-commit-sha>
   
   # Update docker-compose.yml to use the specific SHA
   # Then restart:
   docker compose up -d backend
   ```

## Troubleshooting

### Common Issues

**Issue**: Deployment fails with "Permission denied"
- **Solution**: Verify SSH_KEY_PRODUCTION is correctly configured and has proper permissions on the server

**Issue**: Docker pull fails with "unauthorized"
- **Solution**: Ensure GITHUB_TOKEN has proper permissions and the image repository is accessible

**Issue**: Container fails to start
- **Solution**: Check logs with `docker compose logs backend` and verify environment variables

**Issue**: Database migration fails
- **Solution**: Check database permissions and connectivity

## Security Considerations

1. **Secrets Management**: Never commit secrets to the repository
2. **SSH Keys**: Use dedicated deployment keys with minimal permissions
3. **HTTPS**: Configure a reverse proxy (nginx/traefik) with SSL certificates
4. **Firewall**: Restrict access to only necessary ports
5. **Docker Security**: Keep base images updated and scan for vulnerabilities

## Future Enhancements

- [ ] Add frontend CI/CD pipeline
- [ ] Implement blue-green deployment
- [ ] Add automated backup procedures
- [ ] Set up monitoring and alerting
- [ ] Configure staging environment
- [ ] Implement automated rollback on failure
- [ ] Add health checks and smoke tests post-deployment
