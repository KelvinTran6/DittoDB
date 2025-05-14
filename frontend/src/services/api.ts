import axios from 'axios';
import type { Dataset, QueryResult, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file: File): Promise<ApiResponse<Dataset>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const executeQuery = async (datasetId: string, query: string): Promise<ApiResponse<QueryResult>> => {
  const response = await api.post('/query', {
    dataset_id: datasetId,
    query,
  });
  
  return response.data;
}; 