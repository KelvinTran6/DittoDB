import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FileUpload } from '../components/FileUpload';
import { TableView } from '../components/TableView';
import type { Dataset } from '../types';
import { supabase } from '../lib/supabase';

interface HomeProps {
  tableId: string;
}

export const Home = ({ tableId }: HomeProps) => {
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDataset = async () => {
      try {
        // Load dataset from localStorage using tableId
        const savedDataset = localStorage.getItem(`table-${tableId}`);
        if (savedDataset) {
          setDataset(JSON.parse(savedDataset));
        }
      } catch (error) {
        console.error('Error loading dataset:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDataset();
  }, [tableId]);

  const handleUpload = async (dataset: Dataset) => {
    // Save dataset to localStorage without modifying the dataset_id
    localStorage.setItem(`table-${tableId}`, JSON.stringify(dataset));
    setDataset(dataset);
    toast.success('File uploaded successfully!');
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      // Save dataset to localStorage without modifying the dataset_id
      localStorage.setItem(`table-${tableId}`, JSON.stringify(data));
      setDataset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();
    }
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Toaster position="top-right" />
      {!dataset ? (
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-2">Upload Your CSV File</h2>
              <p className="text-gray-600">Get started by uploading your CSV file</p>
            </div>
            <FileUpload onUpload={handleUpload} onError={handleError} />
          </div>
        </div>
      ) : (
        <div className="h-full">
          <TableView dataset={dataset} />
        </div>
      )}
    </div>
  );
}; 