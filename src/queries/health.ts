import { useQuery } from '@tanstack/react-query';

import { healthService } from '../services';
import { queryKeys } from './keys';

export function useHealth(options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthService.check,
    retry: false,
    refetchInterval: options.refetchInterval,
  });
}
