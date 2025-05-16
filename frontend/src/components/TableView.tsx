import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { Dataset } from '../types';

interface TableViewProps {
  dataset: Dataset;
}

type TableData = Record<string, any>;

export const TableView = ({ dataset }: TableViewProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const columnHelper = createColumnHelper<TableData>();
  
  const columns = dataset.schema.columns.map(column => 
    columnHelper.accessor(column, {
      header: () => (
        <span className="font-medium">{column}</span>
      ),
      cell: (info) => info.getValue()?.toString() ?? 'null',
    })
  );

  const table = useReactTable({
    data: dataset.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 3,
      },
    },
  });

  // Get the current rows and add empty rows if needed
  const currentRows = table.getRowModel().rows;
  const emptyRows = Math.max(0, 3 - currentRows.length);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed bg-white rounded-lg border border-gray-200 shadow-sm cursor-move"
      style={{ 
        width: '600px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-900">{dataset.schema.row_count || 0} rows</h3>
        <div className="flex items-center space-x-1">
          <button
            className="px-1.5 py-0.5 text-xs border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ←
          </button>
          <button
            className="px-1.5 py-0.5 text-xs border border-gray-200 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            →
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-2 py-1.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {Array.from({ length: emptyRows }).map((_, index) => (
              <tr key={`empty-${index}`} className="h-[32px]">
                {columns.map((_, colIndex) => (
                  <td
                    key={`empty-cell-${colIndex}`}
                    className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 border-r border-gray-200 last:border-r-0"
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 