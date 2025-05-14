from pydantic import BaseModel
from typing import Dict, List, Any

class QueryRequest(BaseModel):
    query: str
    dataset_id: str

class SchemaResponse(BaseModel):
    columns: List[str]
    dtypes: Dict[str, str]
    row_count: int

class UploadResponse(BaseModel):
    dataset_id: str
    schema: SchemaResponse
    data: List[Dict[str, Any]]
    message: str 