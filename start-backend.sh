#!/bin/bash

echo "Starting DittoBase Backend..."

cd backend

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
if [ ! -d "venv/lib/python*/site-packages/fastapi" ]; then
    echo "Installing requirements..."
    pip install -r requirements.txt
fi

# Start the server
echo "Starting server..."
uvicorn app.main:app --reload 