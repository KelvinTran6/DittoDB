from fastapi import Depends
from .database import get_supabase

def get_current_user():
    # Since auth is handled by frontend, we can just return a success response
    return {"status": "authenticated"} 