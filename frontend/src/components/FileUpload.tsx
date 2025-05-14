import { useDropzone } from 'react-dropzone';
import type { Dataset } from '../types';

interface FileUploadProps {
  onUpload: (dataset: Dataset) => void;
  onError: (error: string) => void;
}

export const FileUpload = ({ onUpload, onError }: FileUploadProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8000/data/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onUpload(data);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Upload failed');
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors w-full
        ${isDragActive 
          ? 'border-primary-400 bg-primary-900/20' 
          : 'border-gray-700 hover:border-primary-400 hover:bg-primary-900/10'
        }`}
    >
      <input {...getInputProps()} className="w-full h-full" />
      <div className="flex flex-col items-center justify-center space-y-4 w-full">
        <svg className="h-16 w-16 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="space-y-2 w-full">
          <p className="text-lg font-medium text-gray-200">
            {isDragActive ? "Drop your CSV file here" : "Drag and drop your CSV file"}
          </p>
          <p className="text-sm text-gray-400">
            or click to select a file
          </p>
        </div>
      </div>
    </div>
  );
}; 