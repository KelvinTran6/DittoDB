import duckdb
from pathlib import Path
from datetime import datetime
import numpy as np
from ..core.config import DATA_DIR
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class DataService:
    @staticmethod
    async def process_upload(file_content: bytes, filename: str) -> dict:
        # Save the uploaded file temporarily
        temp_file_path = DATA_DIR / f"temp_{filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)
        
        try:
            # Generate unique dataset ID
            dataset_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            logger.debug(f"Generated dataset_id: {dataset_id}")
            
            # Create a dataset-specific directory
            dataset_dir = DATA_DIR / f"dataset_{dataset_id}"
            dataset_dir.mkdir(exist_ok=True)
            logger.debug(f"Created dataset directory: {dataset_dir}")
            
            # Create DuckDB connection and load CSV directly
            db_path = dataset_dir / "data.db"
            logger.debug(f"Database path: {db_path}")
            conn = duckdb.connect(str(db_path))
            
            # Create table from CSV
            conn.execute(f"CREATE TABLE data AS SELECT * FROM read_csv_auto('{temp_file_path}')")
            
            # Get schema information
            schema_info = conn.execute("DESCRIBE data").fetchdf()
            schema = {
                "columns": schema_info['column_name'].tolist(),
                "dtypes": dict(zip(schema_info['column_name'], schema_info['column_type'])),
                "row_count": conn.execute("SELECT COUNT(*) FROM data").fetchone()[0]
            }
            
            # Get all data and handle nan values
            df = conn.execute("SELECT * FROM data").fetchdf()
            df = df.replace({np.nan: None})  # Convert nan to None (which becomes null in JSON)
            preview_data = df.to_dict(orient='records')
            
            conn.close()
            
            return {
                "dataset_id": dataset_id,
                "schema": schema,
                "data": preview_data,
                "message": "File uploaded and processed successfully"
            }
            
        finally:
            # Clean up temporary file
            if temp_file_path.exists():
                temp_file_path.unlink()
    
    @staticmethod
    def execute_query(dataset_id: str, query: str) -> dict:
        dataset_dir = DATA_DIR / f"dataset_{dataset_id}"
        db_path = dataset_dir / "data.db"
        logger.debug(f"Looking for database at: {db_path}")
        logger.debug(f"DATA_DIR: {DATA_DIR}")
        logger.debug(f"Directory exists: {dataset_dir.exists()}")
        logger.debug(f"Database exists: {db_path.exists()}")
        
        if not db_path.exists():
            raise FileNotFoundError("Dataset not found")
        
        conn = duckdb.connect(str(db_path))
        result = conn.execute(query).fetchdf()
        result = result.replace({np.nan: None})  # Convert nan to None
        conn.close()
        
        return {
            "columns": result.columns.tolist(),
            "data": result.to_dict(orient="records")
        } 