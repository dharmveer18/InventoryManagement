Inventory Management System Frontend 
This is the user interface (frontend) for our Inventory Management System. It's built with React for dynamic components and Vite for a fast development experience.

Prerequisites
Make sure you have these installed before starting:

Node.js (v20 or higher)

npm (comes with Node.js)

Backend Server must be running (see the backend's README).

Local Development Setup 
Here’s how to get the application running locally.

1. Install Dependencies
Open your terminal in this directory and install everything needed:

Bash

npm install
2. Configure API URL
Create a file named .env in the root directory. This tells the frontend where your backend API is located.

Code snippet

VITE_API_URL=http://localhost:8000  # Update if your backend uses a different port
3. Start the Server
Run this command to start the development server with hot-reloading:

Bash

npm run dev
The application will be live at: http://localhost:5173

Docker Setup
Use Docker for a consistent, contained environment.

1. Build and Run Containers
Use Docker Compose to manage the container build and startup.

Bash

# Build the image and start the container in the background
docker-compose up -d frontend --build
The application will be accessible at: http://localhost:80

Building for Production 🛠️
To create the final, optimized files for deployment:

Bash

# Creates the production build in the 'dist' directory
npm run build
You can preview those built files locally:

Bash

# Serves the production build locally for testing
npm run preview
Project Structure Overview
Here’s where you'll find everything:

src/: All core source code.

api/: Functions for handling backend API communication.

auth/: Authentication components and context.

pages/: Full-page views (e.g., InventoryList, Reports).

App.jsx: The main root component.

main.tsx: The application's entry point (React initialization).

Development Guidelines
We prioritize clean, maintainable code:

Use TypeScript (.tsx) for new components.

Implement robust error handling across API calls.

Ensure your code passes the linter by running: npm run lint

Keep code style consistent by running: npm run format

Troubleshooting
Common Issues
API Connection Issues

Check if the backend server is running.

Verify the VITE_API_URL value in your .env file is correct.

Build Issues

Delete the node_modules folder and reinstall dependencies (npm install).

Fix any reported TypeScript errors before building