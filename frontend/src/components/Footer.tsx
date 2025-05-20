import { useState } from 'react';

interface FooterProps {
  datasetId: string;
}

export const Footer = ({ datasetId }: FooterProps) => {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEndpoint = async () => {
    console.log('Button clicked');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/data/generate_api_url?dataset_id=${datasetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create endpoint');
      }

      const data = await response.json();
      setEndpoint(data.api_url);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          {endpoint && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">API URL:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {endpoint}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(endpoint);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Copy
              </button>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleCreateEndpoint}
          disabled={isLoading}
          className="relative px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isLoading ? 'Creating...' : 'Create API Endpoint'}
        </button>
      </div>
    </div>
  );
}; 