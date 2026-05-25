'use client';

interface EntityCardProps {
  data: Record<string, any>;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntityCard({ data, onEdit, onDelete }: EntityCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3 mb-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium capitalize">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex-1 rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
