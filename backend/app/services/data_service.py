import duckdb
from pathlib import Path
from datetime import datetime
import numpy as np
from ..core.config import DATA_DIR
import logging
from typing import Any
from contextlib import contextmanager
from fastapi import HTTPException

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class DataService:
    @staticmethod
    @contextmanager
    def get_db_connection(dataset_id: str):
        """Helper function to get a database connection for a dataset.
        
        Args:
            dataset_id: The ID of the dataset to connect to
            
        Yields:
            A DuckDB connection to the dataset's database
            
        Raises:
            FileNotFoundError: If the dataset doesn't exist
        """
        dataset_dir = DATA_DIR / f"dataset_{dataset_id}"
        db_path = dataset_dir / "data.db"
        
        if not db_path.exists():
            raise FileNotFoundError("Dataset not found")
        
        conn = duckdb.connect(str(db_path))
        try:
            yield conn
        finally:
            conn.close()

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
        with DataService.get_db_connection(dataset_id) as conn:
            result = conn.execute(query).fetchdf()
            result = result.replace({np.nan: None})  # Convert nan to None
            
            return {
                "columns": result.columns.tolist(),
                "data": result.to_dict(orient="records")
            }

    @staticmethod
    def add_row(dataset_id: str, row_data: dict) -> dict:
        with DataService.get_db_connection(dataset_id) as conn:
            try:
                # Get column names from the table
                result = conn.execute("SELECT * FROM data LIMIT 0").fetchdf()
                columns = result.columns.tolist()
                if not columns:
                    raise ValueError("No columns found in the table")
                
                # Create INSERT statement
                placeholders = ", ".join(["?" for _ in columns])
                column_names = ", ".join(columns)
                
                # Prepare values, ensuring all columns have a value
                values = []
                for col in columns:
                    value = row_data.get(col)
                    if value is None:
                        value = ""  # Default to empty string for null values
                    values.append(value)
                
                # Insert the new row
                conn.execute(f"INSERT INTO data ({column_names}) VALUES ({placeholders})", values)
                
                # Get the updated data
                result = conn.execute("SELECT * FROM data").fetchdf()
                result = result.replace({np.nan: None})  # Convert nan to None
                
                return {
                    "columns": result.columns.tolist(),
                    "data": result.to_dict(orient="records")
                }
            except Exception as e:
                logger.error(f"Error adding row to dataset {dataset_id}: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to add row: {str(e)}"
                )

    @staticmethod
    def delete_row(dataset_id: str, row_index: int) -> dict:
        with DataService.get_db_connection(dataset_id) as conn:
            conn.execute("""
                DELETE FROM data
                USING (
                    SELECT rowid, ROW_NUMBER() OVER () AS rn
                    FROM data
                ) numbered
                WHERE data.rowid = numbered.rowid AND numbered.rn = ?
            """, [row_index + 1])  # +1 because ROW_NUMBER() is 1-based
            
            # Get the updated data
            result = conn.execute("SELECT * FROM data").fetchdf()
            result = result.replace({np.nan: None})  # Convert nan to None
            
            return {
                "columns": result.columns.tolist(),
                "data": result.to_dict(orient="records")
            }

    @staticmethod
    def update_cell(dataset_id: str, row_index: int, column: str, value: Any) -> dict:
        with DataService.get_db_connection(dataset_id) as conn:
            # Verify column exists
            columns = conn.execute("SELECT * FROM data LIMIT 0").columns
            if column not in columns:
                raise ValueError(f"Column '{column}' not found in dataset")
            
            # Update the cell using ROW_NUMBER() in a subquery
            conn.execute("""
                UPDATE data 
                SET "{}" = ? 
                USING (
                    SELECT rowid, ROW_NUMBER() OVER () AS rn
                    FROM data
                ) numbered
                WHERE data.rowid = numbered.rowid AND numbered.rn = ?
            """.format(column), [value, row_index + 1])
            
            # Get the updated data
            result = conn.execute("SELECT * FROM data").fetchdf()
            result = result.replace({np.nan: None})  # Convert nan to None
            
            return {
                "columns": result.columns.tolist(),
                "data": result.to_dict(orient="records")
            } 