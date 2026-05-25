'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntityType } from '@/types/index';
import { schemas } from '@/lib/schemas';
import { useUpdateEntity } from '@/hooks/useApi';
import { toInputDate } from '@/lib/dates';

interface EditFormProps {
  entity: EntityType;
  item: Record<string, any>;
  onClose: () => void;
}

const FIELDS: Record<EntityType, string[]> = {
  employees: ['employee_id', 'first_name', 'last_name', 'middle_names', 'gender', 'date_of_birth', 'date_of_hiring', 'date_of_termination', 'date_of_probation_end'],
  departments: ['dept_no', 'dept_name'],
  salaries: ['emp_no', 'salary', 'from_date', 'to_date'],
  titles: ['emp_no', 'title', 'from_date', 'to_date'],
  dept_emp: ['emp_no', 'dept_no', 'from_date', 'to_date'],
  dept_manager: ['emp_no', 'dept_no', 'from_date', 'to_date'],
};

const ID_FIELD: Record<EntityType, string> = {
  employees: 'emp_no',
  departments: 'dept_no',
  salaries: 'emp_no',
  titles: 'emp_no',
  dept_emp: 'emp_no',
  dept_manager: 'emp_no',
};

function normalizeDefaults(item: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = { ...item };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string' && result[key].includes('T')) {
      result[key] = toInputDate(result[key]);
    }
  }
  return result;
}

export default function EditForm({ entity, item, onClose }: EditFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemas[entity]),
    defaultValues: normalizeDefaults(item),
  });

  const updateEntity = useUpdateEntity(entity);
  const id = item[ID_FIELD[entity]];

  const onSubmit = async (data: any) => {
    try {
      await updateEntity.mutateAsync({ id, data });
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <h3 className="text-lg font-semibold mb-4">Edit {entity.slice(0, -1)}</h3>

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
            disabled={updateEntity.isPending}
            className="flex-1 rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {updateEntity.isPending ? 'Saving...' : 'Save'}
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
