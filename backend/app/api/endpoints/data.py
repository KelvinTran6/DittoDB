from fastapi import APIRouter, UploadFile, File, HTTPException, Path
from ...services.data_service import DataService
from ...schemas.data import QueryRequest, UploadResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        content = await file.read()
        result = await DataService.process_upload(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
async def execute_query(
    request: QueryRequest,
):
    return DataService.execute_query(request.dataset_id, request.query)

@router.post("/generate_api_url")
async def generate_api_url(
    dataset_id: str,
):
    # Generate a unique API URL for the dataset
    api_url = f"/data/{dataset_id}"  # Remove /api prefix since it's already in the router
    return {"api_url": api_url}

@router.get("/{dataset_id}")  # Simplified route path
async def get_dataset_data(
    dataset_id: str = Path(...)
):
    logger.debug(f"Received request for dataset_id: {dataset_id}")
    try:
        result = DataService.execute_query(dataset_id, "SELECT * FROM data")
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset not found") 