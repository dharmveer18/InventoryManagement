import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export type AppUser = {
  id: number;
  username: string;
  email: string;
  role?: 'admin' | 'manager' | 'viewer';
};

const usersKey = ['users'];

export function useUsersList() {
  return useQuery<AppUser[]>({
    queryKey: usersKey,
    queryFn: async () => {
      const { data } = await api.get('/users/');
      // Support both paginated and non-paginated responses
      // DRF with pagination returns: { count, next, previous, results: [...] }
      if (Array.isArray(data)) return data as AppUser[];
      if (data && Array.isArray((data as any).results)) return (data as any).results as AppUser[];
      return [] as AppUser[];
    },
    staleTime: 10_000,
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: 'admin'|'manager'|'viewer' }) => {
      const { data } = await api.post(`/users/${id}/set-role/`, { role });
      return data as { status: string; role: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKey });
    }
  });
}
