'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EntityType } from '@/types/index';
import { fetchEntityList, createEntity, updateEntity, deleteEntity } from '@/app/api/client';

export function useEntityList(entity: EntityType) {
  return useQuery({
    queryKey: [entity],
    queryFn: () => fetchEntityList(entity),
  });
}

export function useCreateEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createEntity(entity, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}

export function useUpdateEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      updateEntity(entity, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}

export function useDeleteEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteEntity(entity, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}
