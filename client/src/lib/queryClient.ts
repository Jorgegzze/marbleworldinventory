import { QueryClient } from "@tanstack/react-query";
import { localDB } from './localStorage';

// Simulated API request function that uses localStorage
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options?: { headers?: Record<string, string> }
): Promise<any> {
  // Parse the endpoint from the URL
  const endpoint = url.split('/api/')[1];

  switch (endpoint) {
    case 'materials':
      switch (method) {
        case 'GET':
          return await localDB.getMaterials();
        case 'POST':
          return await localDB.createMaterial(data as any);
        default:
          throw new Error(`Unsupported method ${method} for materials`);
      }

    case 'upload':
      if (method === 'POST' && data instanceof FormData) {
        const file = data.get('image') as File;
        if (!file) throw new Error('No file provided');
        return await localDB.uploadImage(file);
      }
      throw new Error('Invalid upload request');

    case endpoint.match(/^materials\/\d+$/)?.input:
      const id = parseInt(endpoint.split('/')[1]);
      switch (method) {
        case 'GET':
          return await localDB.getMaterial(id);
        case 'PATCH':
          return await localDB.updateMaterial(id, data as any);
        case 'DELETE':
          return await localDB.deleteMaterial(id);
        default:
          throw new Error(`Unsupported method ${method} for material ${id}`);
      }

    case endpoint.match(/^materials\/\d+\/(reservar|vender)$/)?.input:
      const [, materialId, action] = endpoint.split('/');
      const quantity = (data as any)?.cantidad || 1;

      if (action === 'reservar') {
        return await localDB.reserveMaterial(parseInt(materialId), quantity);
      } else if (action === 'vender') {
        return await localDB.sellMaterial(parseInt(materialId), quantity);
      }
      break;

    default:
      throw new Error(`Unsupported endpoint: ${endpoint}`);
  }
}

// Configure the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});