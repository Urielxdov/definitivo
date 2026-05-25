'use client';

import { useState } from 'react';
import { EntityType } from '@/types/index';
import { useEntityList, useDeleteEntity } from '@/hooks/useApi';

const ID_FIELD: Record<EntityType, string> = {
  employees: 'emp_no',
  departments: 'dept_no',
  salaries: 'emp_no',
  titles: 'emp_no',
  dept_emp: 'emp_no',
  dept_manager: 'emp_no',
  salary_groups: 'sg_no',
  sg_emp: 'emp_no',
  countries: 'id',
  regions: 'id',
  region_emp: 'emp_no',
};
import EntityCard from './EntityCard';
import CreateForm from './CreateForm';
import EditForm from './EditForm';
import DeleteConfirm from './DeleteConfirm';

interface EntityListProps {
  entity: EntityType;
}

export default function EntityList({ entity }: EntityListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const { data, isLoading, error } = useEntityList(entity);
  const deleteEntity = useDeleteEntity(entity);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading data</div>;
  }

  const items = data?.data || [];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowCreate(true)}
        className="rounded bg-green-500 px-4 py-2 text-white font-medium hover:bg-green-600 transition-colors"
      >
        + Add {entity.slice(0, -1)}
      </button>

      {showCreate && (
        <CreateForm
          entity={entity}
          onClose={() => setShowCreate(false)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => {
          const id = item[ID_FIELD[entity]];
          return (
            <div key={id}>
              {editingId === id ? (
                <EditForm
                  entity={entity}
                  item={item}
                  onClose={() => setEditingId(null)}
                />
              ) : (
                <EntityCard
                  data={item}
                  onEdit={() => setEditingId(id)}
                  onDelete={() => setDeleteId(id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {deleteId && (
        <DeleteConfirm
          onConfirm={() => {
            deleteEntity.mutate(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
