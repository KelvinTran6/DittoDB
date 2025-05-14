from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from ...core.dependencies import create_access_token, get_current_user
from ...core.config import SECRET_KEY, ALGORITHM
from ...core.database import get_supabase

router = APIRouter()

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user 