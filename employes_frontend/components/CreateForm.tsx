'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityType, Employee, Department, Salary, Title, DeptEmp, DeptManager } from '@/types/index';
import { schemas } from '@/lib/schemas';
import { useCreateEntity } from '@/hooks/useApi';

interface CreateFormProps {
  entity: EntityType;
  onClose: () => void;
}

type FormData = Employee | Department | Salary | Title | DeptEmp | DeptManager;

const FIELDS: Record<EntityType, string[]> = {
  employees: ['employee_id', 'first_name', 'last_name', 'middle_names', 'gender', 'date_of_birth', 'date_of_hiring', 'date_of_termination', 'date_of_probation_end'],
  departments: ['dept_no', 'dept_name'],
  salaries: ['emp_no', 'salary', 'from_date', 'to_date'],
  titles: ['emp_no', 'title', 'from_date', 'to_date'],
  dept_emp: ['emp_no', 'dept_no', 'from_date', 'to_date'],
  dept_manager: ['emp_no', 'dept_no', 'from_date', 'to_date'],
};

export default function CreateForm({ entity, onClose }: CreateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemas[entity]),
  });

  const createEntity = useCreateEntity(entity);

  const onSubmit = async (data: any) => {
    try {
      await createEntity.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Create New {entity.slice(0, -1)}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {FIELDS[entity].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.replace(/_/g, ' ')}
            </label>
            <input
              {...register(field)}
              type={field.includes('date') ? 'date' : 'text'}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors[field as keyof typeof errors] && (
              <p className="text-red-500 text-xs mt-1">
                {(errors[field as keyof typeof errors]?.message) as string}
              </p>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={createEntity.isPending}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {createEntity.isPending ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
