import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { FileUpload } from '../components/FileUpload';
import type { Dataset } from '../types';
import { uploadFile } from '../services/api';
import { supabase } from '../lib/supabase';

export const Home = () => {
  const [loading, setLoading] = useState(false);

  const handleUpload = (dataset: Dataset) => {
    console.log('Dataset uploaded:', dataset);
  };

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  useEffect(() => {
    const loadUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();
      console.log(user);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-background-dark flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="w-full bg-background-darker border-b border-gray-800">
        <div className="w-full px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-primary-400">DittoBase</h1>
          <p className="mt-2 text-gray-400">Upload your CSV files and query them with SQL</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-2xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-2">Upload Your CSV File</h2>
            <p className="text-gray-400">Get started by uploading your CSV file</p>
          </div>
          <div className="w-full max-w-xl mx-auto">
            <FileUpload onUpload={handleUpload} onError={handleError} />
          </div>
        </div>
      </main>
    </div>
  );
}; 