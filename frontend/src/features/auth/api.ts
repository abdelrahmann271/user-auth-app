import { apiClient } from '../../shared/api';
import type { AuthResponse } from '../../shared/types';

export const authApi = {
  signup: async (email: string, name: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      name,
      password,
    });
    return data;
  },

  signin: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signin', {
      email,
      password,
    });
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/logout');
    return data;
  },
};
