from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Data directory
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Database settings
DATABASE_URL = f"sqlite:///{DATA_DIR}/dittodb.sqlite"

# CORS settings
CORS_ORIGINS = ["http://localhost:5173"]  # Frontend URL

# Supabase settings for database operations
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 