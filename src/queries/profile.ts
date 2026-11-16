import { useMutation, useQuery } from '@tanstack/react-query';

import { profileService, type Profile, type ProfileUpdate } from '../services';
import { patchCache, queryClient, rollback } from './query-client';
import { queryKeys } from './keys';

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: profileService.get });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => profileService.update(patch),
    onMutate: (patch) =>
      patchCache<Profile>(queryKeys.profile, (old) => ({ ...old, ...patch })),
    onError: (_err, _patch, snapshot) => rollback(snapshot),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile, profile);
      // name and timezone are also part of the current user.
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
