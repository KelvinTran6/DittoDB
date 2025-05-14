from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Path
from ...services.data_service import DataService
from ...schemas.data import QueryRequest, UploadResponse
from ...core.dependencies import get_current_user

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    return await DataService.process_upload(content, file.filename, current_user["username"])

@router.post("/query")
async def execute_query(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    return DataService.execute_query(request.dataset_id, request.query, current_user["username"])

@router.post("/generate_api_url")
async def generate_api_url(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Generate a unique API URL for the dataset
    api_url = f"/api/data/{current_user['username']}/{dataset_id}"
    return {"api_url": api_url}

@router.get("/api/data/{username}/{dataset_id}")
async def get_dataset_data(
    username: str = Path(...),
    dataset_id: str = Path(...)
):
    # Fetch the dataset data using the username and dataset_id
    try:
        result = DataService.execute_query(dataset_id, "SELECT * FROM data", username)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset not found") 