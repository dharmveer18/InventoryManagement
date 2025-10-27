# Inventory Management System — Backend

Django + DRF API for the Inventory Management System. JWT auth, role-based permissions, audit logs, and inventory endpoints.

## Prerequisites
- Python 3.11+
- pip
- virtualenv (recommended)
- Docker and Docker Compose (optional)

## Local development

1) Create and activate a virtualenv

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Migrate database and seed data

```bash
python manage.py migrate
python manage.py seed_users   # creates admin/manager/viewer users
python manage.py seed_items   # seeds sample items
```

Optional utilities:

```bash
python manage.py list_users_sql  # list users with roles
python manage.py list_items      # list items
```

4) Run the server

```bash
python manage.py runserver
```

API root: http://localhost:8000/api/

## Authentication
- Obtain tokens: `POST /api/token/` with `{ username, password }`
- Refresh token: `POST /api/token/refresh/` with `{ refresh }`
- OpenAPI docs: http://localhost:8000/api/docs/

Seeded users (after running `seed_users`):
- admin.user / Admin@123 — admin
- manager.user / Manager@123 — manager
- basic.user1 / Basic@123 — viewer
- basic.user2 / Basic@123 — viewer

## Docker

```bash
docker-compose up -d --build
```

Common actions:

```bash
docker-compose logs -f backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## Environment variables
- `DEBUG` — True/False
- `SECRET_KEY` — Django secret
- `ALLOWED_HOSTS` — comma-separated list
- `DATABASE_URL` — optional external DB URL

## Testing

```bash
python manage.py test
# or with coverage
coverage run manage.py test && coverage report
```