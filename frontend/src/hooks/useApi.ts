import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import api from '@/services/api';

export const useGet = <T,>(
  key: string[],
  url: string,
  enabled = true,
): UseQueryResult<T> =>
  useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<T>(url);
      return data;
    },
    enabled,
  });

export const usePost = <TData, TResponse>(): UseMutationResult<TResponse, Error, TData> =>
  useMutation({
    mutationFn: async (data: TData) => {
      const { data: response } = await api.post<TResponse>('/', data);
      return response;
    },
  });

export const usePut = <TData, TResponse>(): UseMutationResult<TResponse, Error, { id: string; data: TData }> =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TData }) => {
      const { data: response } = await api.put<TResponse>(`/${id}`, data);
      return response;
    },
  });
