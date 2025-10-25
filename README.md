# Inventory Management System

A full-stack inventory management application built with Django (backend) and React (frontend).

## Features

- **User Authentication & Role-Based Access Control (RBAC)**
  - Admin, Manager, and Viewer roles
  - JWT-based authentication

- **Inventory Management**
  - Item CRUD operations
  - Stock tracking and history
  - Low stock threshold alerts
  - Bulk CSV upload for stock updates

- **Reports & Analytics**
  - Monthly reports
  - Stock trend visualization
  - Audit logs

## Architecture

- **Backend**: Django REST Framework with SQLite database
- **Frontend**: React with Vite
- **Deployment**: Docker containers on production server
- **CI/CD**: GitHub Actions with automated testing and deployment

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)

### Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend will be available at: http://localhost:8000

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

### Docker Setup

```bash
docker-compose up -d --build
```

## Documentation

- [Backend Documentation](./backend/README.md) - Backend setup and API details
- [Frontend Documentation](./frontend/README.md) - Frontend setup and development
- [Deployment Guide](./DEPLOYMENT.md) - CI/CD pipeline and deployment instructions
- [Requirements](./Requiremtns.md) - Feature requirements and specifications

## CI/CD Pipeline

The project uses GitHub Actions for automated CI/CD:

### Backend Pipeline
- **CI**: Runs migrations and tests on every push/PR
- **Build**: Creates Docker images and pushes to GitHub Container Registry (GHCR)
- **Deploy**: Automatically deploys to production server on main branch

### Frontend Pipeline
- **CI**: Runs linting and builds on every push/PR
- **Build**: Creates Docker images and pushes to GHCR
- **Deploy**: TODO - Deployment configuration pending

### Deployment Location

The application deploys to a production server via SSH:
- **Container Registry**: `ghcr.io/dharmveer18/inventorymanagement-backend` and `ghcr.io/dharmveer18/inventorymanagement-frontend`
- **Production Server**: Remote server (configured via GitHub Secrets)
- **Deployment Path**: `/opt/stack/production/` on the production server

For detailed deployment setup and configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Required GitHub Secrets

For deployment to work, configure these secrets in your GitHub repository:

- `SSH_HOST_PRODUCTION` - Production server hostname/IP
- `SSH_USER_PRODUCTION` - SSH username
- `SSH_KEY_PRODUCTION` - Private SSH key for authentication

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## API Endpoints

- **Admin Interface**: `/admin/`
- **API Root**: `/api/`
- **Authentication**: `/api/auth/`
- **Items**: `/api/items/`
- **Stock**: `/api/stock/`
- **Reports**: `/api/reports/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
