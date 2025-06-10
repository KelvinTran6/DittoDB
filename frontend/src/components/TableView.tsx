import { useState, useEffect } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  type Column,
  type Row
} from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import type { Dataset, Schema } from '../types';
import { AddRowModal } from './AddRowModal';

interface TableViewProps {
  dataset: Dataset;
}

interface TableData extends Record<string, any> {}

export const TableView = ({ dataset }: TableViewProps) => {
  const [data, setData] = useState<TableData[]>(dataset.data);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [isGeneratingEndpoint, setIsGeneratingEndpoint] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const columnHelper = createColumnHelper<TableData>();

  const columns = [
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDeleteRow(row.index)}
            className="text-red-600 hover:text-red-800"
            title="Delete row"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ),
    }),
    ...dataset.schema.columns.map(column => 
      columnHelper.accessor(column, {
        header: column,
        cell: ({ getValue, row, column }) => {
          const value = getValue();
          const isEditing = editingCell?.rowIndex === row.index && editingCell?.columnId === column.id;
          
          if (isEditing) {
            return (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleSaveEdit(row.index, column.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(row.index, column.id);
                  }
                }}
                className="w-full h-full px-2 py-1 border-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                autoFocus
              />
            );
          }
          
          return (
            <div 
              className="w-full h-full px-2 py-1 cursor-pointer hover:bg-gray-50"
              onClick={() => handleCellClick(row.index, column.id, value)}
            >
              <span className="block truncate">{value}</span>
            </div>
          );
        }
      })
    )
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Generate API endpoint on mount
  useEffect(() => {
    const generateEndpoint = async () => {
      setIsGeneratingEndpoint(true);
      try {
        const response = await fetch('http://localhost:8000/data/generate_api_url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataset_id: dataset.dataset_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate API endpoint');
        }

        const data = await response.json();
        setEndpoint(data.api_url);
      } catch (error) {
        console.error('Error generating API endpoint:', error);
        // Set a default endpoint if generation fails
        setEndpoint(`http://localhost:8000/data/${dataset.dataset_id}`);
      } finally {
        setIsGeneratingEndpoint(false);
      }
    };

    generateEndpoint();
  }, [dataset.dataset_id]);

  const handleCellClick = (rowIndex: number, columnId: string, value: any) => {
    setEditingCell({ rowIndex, columnId });
    setEditValue(value);
  };

  const handleSaveEdit = async (rowIndex: number, columnId: string) => {
    if (!endpoint) return;

    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnId]: editValue
    };

    try {
      const response = await fetch(`${endpoint}/cell`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          row_index: rowIndex,
          column: columnId,
          value: editValue
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cell');
      }

      const result = await response.json();
      setData(result.data);
      toast.success('Cell updated successfully');
    } catch (error) {
      console.error('Error updating cell:', error);
      toast.error('Failed to update cell');
    }

    setEditingCell(null);
  };

  const handleDeleteRow = async (rowIndex: number) => {
    if (!endpoint) return;

    try {
      const response = await fetch(`${endpoint}/row/${rowIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete row');
      }

      const newData = data.filter((_, index) => index !== rowIndex);
      setData(newData);
      toast.success('Row deleted successfully');
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete row');
    }
  };

  const handleAddRow = () => {
    setIsAddModalOpen(true);
  };

  const handleSubmitNewRow = async (rowData: Record<string, any>) => {
    if (!endpoint) return;

    try {
      const response = await fetch(`${endpoint}/row`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rowData),
      });

      if (!response.ok) {
        throw new Error('Failed to add row');
      }

      const result = await response.json();
      setData(result.data);
      setIsAddModalOpen(false);
      toast.success('Row added successfully');
    } catch (error) {
      console.error('Error adding row:', error);
      toast.error('Failed to add row');
    }
  };

  const handleCopyEndpoint = async () => {
    if (!endpoint) return;
    
    try {
      await navigator.clipboard.writeText(endpoint);
      setIsCopied(true);
      toast.success('API endpoint copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy endpoint');
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Dataset {dataset.dataset_id}</h2>
        {endpoint && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <span>API Endpoint:</span>
            <code className="px-2 py-1 bg-gray-100 rounded">{endpoint}</code>
            <button
              onClick={handleCopyEndpoint}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 flex flex-col space-y-4 border-t border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={handleAddRow}
            className="p-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            title="Add Row"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{table.getState().pagination.pageIndex * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((table.getState().pagination.pageIndex + 1) * 10, dataset.schema.row_count)}
                </span>{' '}
                of <span className="font-medium">{dataset.schema.row_count}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="px-2 flex items-center">
                  {Array.from({ length: table.getPageCount() }, (_, i) => i).map((pageIndex) => (
                    <button
                      key={pageIndex}
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={`relative inline-flex items-center px-3 py-2 mx-1 border text-sm font-medium ${
                        table.getState().pagination.pageIndex === pageIndex
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <AddRowModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitNewRow}
        dataset={dataset}
      />
    </div>
  );
}; 