from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import CORS_ORIGINS
from .api.endpoints import data, auth

app = FastAPI(title="DittoBase API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(data.router, prefix="/data", tags=["data"])

@app.get("/")
async def root():
    return {"message": "Welcome to the API"} 