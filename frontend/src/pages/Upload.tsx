import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Upload() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-600 mb-6">Upload Data</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">
          Welcome, {user?.full_name || user?.email}! Upload your data here.
        </p>
        {/* Upload form will be added here */}
      </div>
    </div>
  );
}

export default Upload; 