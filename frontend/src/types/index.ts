export interface Dataset {
  id: string;
  name: string;
  schema: Schema;
  created_at: string;
}

export interface Schema {
  columns: string[];
  dtypes: Record<string, string>;
}

export interface QueryResult {
  columns: string[];
  data: Record<string, any>[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 