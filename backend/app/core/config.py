from pathlib import Path
from dotenv import load_dotenv
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
logger.debug(f"BASE_DIR: {BASE_DIR}")

# Data directory
DATA_DIR = BASE_DIR / "data"
logger.debug(f"DATA_DIR: {DATA_DIR}")
DATA_DIR.mkdir(exist_ok=True)

# Database settings
DATABASE_URL = f"sqlite:///{DATA_DIR}/dittodb.sqlite"

# CORS settings
CORS_ORIGINS = ["http://localhost:5173"]  # Frontend URL

# Supabase settings for database operations
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 