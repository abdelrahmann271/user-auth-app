import { apiClient } from '../../shared/api';
import type { ProfileResponse } from '../../shared/types';

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>('/users/profile');
    return data;
  },
};
