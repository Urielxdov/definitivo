'use client';

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Delete Item?</h3>
        <p className="text-gray-600 mb-6">This action cannot be undone.</p>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 rounded bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
