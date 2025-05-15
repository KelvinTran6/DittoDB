from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

router = APIRouter()

@router.get("/me")
async def read_users_me():
    # Since auth is handled by frontend, we can just return a success response
    return {"status": "authenticated"} 