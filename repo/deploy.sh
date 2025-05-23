#!/bin/bash
exec > deploy.log 2>&1
set -e
export PATH="$HOME/.local/bin:$PATH"
echo "Starting deployment process..."

# Backend Deployment
echo "Deploying backend..."
cd backend
echo "Unpacking backend archive..."
tar -xzvf api.tar.gz
rm api.tar.gz
echo "Starting backend application..."
nohup gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - api:app &
echo "Backend application started in the background."

# Frontend Deployment
echo "Deploying frontend..."
cd ..
echo "Serving frontend build..."
npx serve -s frontend &
echo "Frontend server started in the background."

echo "Deployment completed."