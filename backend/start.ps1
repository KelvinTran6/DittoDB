# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed. Please install Python first."
    exit 1
}

# Check if we're in the backend directory
if (-not (Test-Path "requirements.txt")) {
    Write-Error "Please run this script from the backend directory"
    exit 1
}

# Remove existing virtual environment if it exists
if (Test-Path "venv") {
    Write-Host "Removing existing virtual environment..."
    Remove-Item -Recurse -Force venv
}

# Create virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

# Install core dependencies first
Write-Host "Installing core dependencies..."
pip install "fastapi==0.104.1" "uvicorn==0.24.0" "python-multipart==0.0.6" "pydantic==2.5.2" "pydantic-settings==2.1.0" "sqlalchemy==2.0.25"

# Install numpy and pandas
Write-Host "Installing numpy and pandas..."
pip install "numpy==1.26.4" "pandas==2.2.1"

# Install supabase and its dependencies
Write-Host "Installing supabase and dependencies..."
python -m pip install "httpx==0.23.3"
python -m pip install "supabase==1.0.3"

# Install duckdb using python -m pip
Write-Host "Installing duckdb..."
python -m pip install --no-cache-dir duckdb

# Install remaining dependencies
Write-Host "Installing remaining dependencies..."
pip install "python-jose[cryptography]==3.3.0" "passlib[bcrypt]==1.7.4" "python-dotenv==1.0.0" "minio==7.2.0"

# Start the backend server
Write-Host "Starting backend server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 