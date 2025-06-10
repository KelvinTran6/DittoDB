import { useState } from 'react';
import { Home } from './Home';

interface TableInstance {
  id: string;
  name: string;
}

export const Dashboard = () => {
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const addNewTable = () => {
    const newTable = {
      id: `table-${Date.now()}`,
      name: `Table ${tables.length + 1}`
    };
    setTables([...tables, newTable]);
    setActiveTableId(newTable.id);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col relative pt-14 bg-gray-50">
      {/* Main content area */}
      <div className="flex-1 px-8 py-6">
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          {tables.length === 0 ? (
            <div className="h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Tables Yet</h2>
                <p className="text-gray-600 mb-4">Create your first table to get started</p>
                <button
                  onClick={addNewTable}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create New Table
                </button>
              </div>
            </div>
          ) : (
            <div>
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`${activeTableId === table.id ? 'block' : 'hidden'}`}
                >
                  <Home tableId={table.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Excel-style sheet tabs at the bottom */}
      <div className="sticky bottom-0 left-0 right-0 h-10 bg-[#f3f2f1] border-t border-gray-300 flex items-center px-8">
        <div className="flex items-center space-x-1 overflow-x-auto flex-1">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => setActiveTableId(table.id)}
              className={`px-4 py-1.5 text-sm border border-gray-300 rounded-t-md transition-colors whitespace-nowrap ${
                activeTableId === table.id
                  ? 'bg-white border-b-0 text-gray-900 font-medium'
                  : 'bg-[#f3f2f1] text-gray-600 hover:bg-gray-100'
              }`}
            >
              {table.name}
            </button>
          ))}
          <button
            onClick={addNewTable}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-t-md transition-colors text-gray-600 hover:bg-gray-100"
            title="New Table"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 