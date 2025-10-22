Inventory Management System Backend
This is the backend service for the Inventory Management System, built using Django and Django Rest Framework (DRF).

Prerequisites
You'll need a few basics before you start:

Python 3.x

pip (Python package manager)

Virtualenv (recommended for clean dependency management)

Docker and Docker Compose (optional, for the containerized setup)

Local Development Setup
Follow these steps to get your environment set up and the server running locally.

1. Create & Activate Virtual Environment
We'll create an isolated environment named venv.

Bash

# Create the virtual environment
python -m venv venv
To activate it:

On Windows:

Bash

venv\Scripts\activate
On Unix or macOS:

Bash

source venv/bin/activate
2. Install Dependencies
With the venv active, install all required packages:

Bash

pip install -r requirements.txt
3. Database & Superuser Setup
Initialize the database and create your administrative account.

Bash

# Apply initial migrations
python manage.py migrate
Bash

# Create a superuser (follow the prompts for username/password)
python manage.py createsuperuser
4. Run Development Server
You're ready to start the server!

Bash

python manage.py runserver
The server will be running at: http://localhost:8000

Docker Setup
Use Docker for a consistent, contained environment.

1. Build and Run Containers
Use Docker Compose to build the necessary images and start your services (backend and database).

Bash

# Build and start the containers (in detached/background mode)
docker-compose up -d --build
The service will be available at: http://localhost:8000

2. Essential Docker Commands
Use these commands to manage and interact with the running backend service.

Stop Containers:

Bash

docker-compose down
View Live Logs (for debugging):

Bash

docker-compose logs -f backend
Run Migrations inside Docker:

Bash

docker-compose exec backend python manage.py migrate
Create Superuser inside Docker:

Bash

docker-compose exec backend python manage.py createsuperuser
API & Access
Once the server is running, use these links:

Admin interface: http://localhost:8000/admin/

API endpoints: http://localhost:8000/api/

Environment Variables
These variables are used for configuration. If not set, default values are usually used (e.g., DEBUG=True).

DEBUG: Set to True/False for development/production mode.

SECRET_KEY: Django secret key.

DATABASE_URL: Database connection string (if using external database).

ALLOWED_HOSTS: Comma-separated list of allowed hosts.

Testing & Utilities
Running Tests
Bash

# Run all tests
python manage.py test
Run Tests with Coverage:

Bash

coverage run manage.py test
coverage report
Utility Commands
Bash

# Seed sample items
python manage.py seed_items
Bash

# Create initial user
python manage.py create_user