import polars as pl
import duckdb
from pathlib import Path
from datetime import datetime
from ..core.config import DATA_DIR

class DataService:
    @staticmethod
    async def process_upload(file_content: bytes, filename: str, user_id: str) -> dict:
        # Save the uploaded file temporarily
        temp_file_path = DATA_DIR / f"temp_{filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)
        
        try:
            # Read CSV with Polars
            df = pl.read_csv(str(temp_file_path))
            
            # Generate unique dataset ID
            dataset_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            
            # Create a user-specific directory
            user_dir = DATA_DIR / f"user_{user_id}"
            user_dir.mkdir(exist_ok=True)
            
            # Create a dataset-specific directory under the user's directory
            dataset_dir = user_dir / f"dataset_{dataset_id}"
            dataset_dir.mkdir(exist_ok=True)
            
            # Save to DuckDB locally in the dataset's directory
            db_path = dataset_dir / "data.db"
            conn = duckdb.connect(str(db_path))
            
            # Convert to Pandas DataFrame and save
            pandas_df = df.to_pandas()
            conn.execute("CREATE TABLE data AS SELECT * FROM pandas_df")
            conn.close()
            
            # Get schema information
            schema = {
                "columns": df.columns,
                "dtypes": {col: str(df.schema[col]) for col in df.columns},
                "row_count": len(df)
            }
            
            # Get preview data (first 5 rows)
            preview_data = df.head(5).to_dicts()
            
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
    def execute_query(dataset_id: str, query: str, user_id: str) -> dict:
        user_dir = DATA_DIR / f"user_{user_id}"
        dataset_dir = user_dir / f"dataset_{dataset_id}"
        db_path = dataset_dir / "data.db"
        if not db_path.exists():
            raise FileNotFoundError("Dataset not found")
        
        conn = duckdb.connect(str(db_path))
        result = conn.execute(query).fetchdf()
        conn.close()
        
        return {
            "columns": result.columns.tolist(),
            "data": result.to_dict(orient="records")
        } 