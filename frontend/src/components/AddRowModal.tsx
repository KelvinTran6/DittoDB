import { useState } from 'react';
import type { Dataset } from '../types';

interface AddRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rowData: Record<string, any>) => Promise<void>;
  dataset: Dataset;
}

export const AddRowModal = ({ isOpen, onClose, onSubmit, dataset }: AddRowModalProps) => {
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  const handleInputChange = (column: string, value: string) => {
    setNewRowData(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, column: string, index: number) => {
    if (e.key === 'Enter') {
      if (index === dataset.schema.columns.length - 1) {
        onSubmit(newRowData);
      } else {
        const nextInput = document.getElementById(`input-${dataset.schema.columns[index + 1]}`);
        nextInput?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[90vw] transform transition-all animate-modalFadeIn">
        <div className="px-8 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Add New Row</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {dataset.schema.columns.map((column, index) => (
              <div key={column} className="group">
                <label 
                  htmlFor={`input-${column}`}
                  className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-purple-600 transition-colors"
                >
                  {column}
                </label>
                <div className="relative">
                  <input
                    id={`input-${column}`}
                    type="text"
                    value={newRowData[column] || ''}
                    onChange={(e) => handleInputChange(column, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    onKeyDown={(e) => handleKeyDown(e, column, index)}
                    autoFocus={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(newRowData)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Add Row
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 