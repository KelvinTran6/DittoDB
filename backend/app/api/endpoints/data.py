from fastapi import APIRouter, UploadFile, File, HTTPException, Path
from ...services.data_service import DataService
from ...schemas.data import QueryRequest, UploadResponse
import logging
from typing import Dict, Any

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
    api_url = f"http://localhost:8000/data/{dataset_id}"  # Return full URL
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

@router.post("/{dataset_id}/row")
async def add_row(
    dataset_id: str = Path(...),
    row_data: Dict[str, Any] = None
):
    try:
        result = DataService.add_row(dataset_id, row_data)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{dataset_id}/row/{row_index}")
async def delete_row(
    dataset_id: str = Path(...),
    row_index: int = Path(...)
):
    try:
        result = DataService.delete_row(dataset_id, row_index)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{dataset_id}/cell")
async def update_cell(
    dataset_id: str = Path(...),
    row_index: int = None,
    column: str = None,
    value: Any = None
):
    if row_index is None or column is None or value is None:
        raise HTTPException(status_code=400, detail="row_index, column, and value are required")
    
    try:
        result = DataService.update_cell(dataset_id, row_index, column, value)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Dataset not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 