export interface Dataset {
  dataset_id: string;
  schema: Schema;
  data: Record<string, any>[];
  message: string;
}

export interface Schema {
  columns: string[];
  dtypes: Record<string, string>;
  row_count: number;
}

export interface QueryResult {
  columns: string[];
  data: Record<string, any>[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 