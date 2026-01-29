import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api';

export const PROFILE_QUERY_KEY = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getProfile,
    enabled: false,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
