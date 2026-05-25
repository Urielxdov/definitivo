import { ApiResponse, EntityType } from '@/types/index';

const API_BASE_URL = '/api/v1';

export async function fetchEntityList(entity: EntityType) {
  const response = await fetch(`${API_BASE_URL}/${entity}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${entity}`);
  }

  return response.json() as Promise<ApiResponse<any[]>>;
}

export async function fetchEntityById(entity: EntityType, id: number | string) {
  const response = await fetch(`${API_BASE_URL}/${entity}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${entity} ${id}`);
  }

  return response.json() as Promise<ApiResponse<any>>;
}

export async function createEntity(entity: EntityType, data: any) {
  const response = await fetch(`${API_BASE_URL}/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create ${entity}`);
  }

  return response.json() as Promise<ApiResponse<any>>;
}

export async function updateEntity(entity: EntityType, id: number | string, data: any) {
  const response = await fetch(`${API_BASE_URL}/${entity}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${entity}`);
  }

  return response.json() as Promise<ApiResponse<any>>;
}

export async function deleteEntity(entity: EntityType, id: number | string) {
  const response = await fetch(`${API_BASE_URL}/${entity}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete ${entity}`);
  }

  return response.json() as Promise<ApiResponse<any>>;
}
