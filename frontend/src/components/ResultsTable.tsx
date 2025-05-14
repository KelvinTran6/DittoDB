import type { QueryResult } from '../types';

interface ResultsTableProps {
  results: QueryResult | null;
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  if (!results) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Query results will appear here
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {results.columns.map((col) => (
              <th
                key={col}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.data.map((row, i) => (
            <tr key={i}>
              {results.columns.map((col) => (
                <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 