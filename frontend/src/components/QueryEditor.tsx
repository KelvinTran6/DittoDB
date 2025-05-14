import { Editor } from '@monaco-editor/react';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const QueryEditor = ({ 
  value, 
  onChange, 
  onExecute, 
  disabled = false,
  loading = false 
}: QueryEditorProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">SQL Query</h2>
      <div className="h-[400px] rounded-lg overflow-hidden shadow-soft">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-light"
          value={value}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
      <button
        onClick={onExecute}
        disabled={disabled || loading}
        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Running Query...' : 'Run Query'}
      </button>
    </div>
  );
}; 