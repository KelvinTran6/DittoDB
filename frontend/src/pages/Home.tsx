import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FileUpload } from '../components/FileUpload';
import { TableView } from '../components/TableView';
import { Footer } from '../components/Footer';
import type { Dataset } from '../types';
import { uploadFile } from '../services/api';
import { supabase } from '../lib/supabase';

export const Home = () => {
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (dataset: Dataset) => {
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

  return (
    <div className="min-h-screen w-screen bg-[#F5F5F5] flex flex-col relative">
      {/* Dotted background pattern */}
      <div 
        className="absolute inset-0 bg-[#F5F5F5]"
        style={{
          backgroundImage: `radial-gradient(#E5E7EB 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      <Toaster position="top-right" />
      <main className="flex-1 flex items-center justify-center w-full relative z-10">
        <div className="w-full max-w-4xl px-4">
          {!dataset ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-2">Upload Your CSV File</h2>
                <p className="text-gray-600">Get started by uploading your CSV file</p>
              </div>
              <div className="w-full max-w-xl mx-auto">
                <FileUpload onUpload={handleUpload} onError={handleError} />
              </div>
            </>
          ) : (
            <div className="mt-8 h-[calc(100vh-200px)] relative">
              <TableView dataset={dataset} />
            </div>
          )}
        </div>
      </main>
      {dataset && <Footer datasetId={dataset.dataset_id} />}
    </div>
  );
}; 