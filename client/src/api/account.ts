import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteSavedPlan,
  fetchFavoriteIds,
  fetchFavorites,
  fetchMe,
  fetchSavedPlans,
  register,
  savePlan,
  setFavorite,
  signIn,
  signOut,
  type SavePlanRequest,
} from './client';

/** Keys of everything that belongs to the signed-in account. */
export const accountKeys = {
  me: ['account', 'me'] as const,
  savedPlans: ['account', 'saved-plans'] as const,
  favorites: ['account', 'favorites'] as const,
  favoriteIds: ['account', 'favorite-ids'] as const,
};

export function useAccount() {
  return useQuery({ queryKey: accountKeys.me, queryFn: fetchMe, staleTime: 5 * 60_000 });
}

/** After signing in, out or up, every account-scoped query starts over. */
function useResetAccount() {
  const client = useQueryClient();
  return async (user: Awaited<ReturnType<typeof fetchMe>>) => {
    client.setQueryData(accountKeys.me, user);
    await client.invalidateQueries({
      queryKey: ['account'],
      predicate: (query) => query.queryKey[1] !== 'me',
    });
  };
}

export function useSignIn() {
  const reset = useResetAccount();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: reset,
  });
}

export function useRegister() {
  const reset = useResetAccount();
  return useMutation({
    mutationFn: (input: { displayName: string; email: string; password: string }) =>
      register(input.displayName, input.email, input.password),
    onSuccess: reset,
  });
}

export function useSignOut() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      client.setQueryData(accountKeys.me, null);
      client.removeQueries({
        queryKey: ['account'],
        predicate: (query) => query.queryKey[1] !== 'me',
      });
    },
  });
}

export function useSavedPlans(enabled: boolean) {
  return useQuery({ queryKey: accountKeys.savedPlans, queryFn: fetchSavedPlans, enabled });
}

export function useFavorites(enabled: boolean) {
  return useQuery({ queryKey: accountKeys.favorites, queryFn: fetchFavorites, enabled });
}

export function useFavoriteIds(enabled: boolean) {
  return useQuery({ queryKey: accountKeys.favoriteIds, queryFn: fetchFavoriteIds, enabled });
}

export function useSavePlan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: SavePlanRequest) => savePlan(request),
    onSuccess: () => client.invalidateQueries({ queryKey: accountKeys.savedPlans }),
  });
}

export function useDeleteSavedPlan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedPlan,
    onSuccess: () => client.invalidateQueries({ queryKey: accountKeys.savedPlans }),
  });
}

export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, saved }: { routeId: string; saved: boolean }) =>
      setFavorite(routeId, saved),
    // The bookmark flips at once; a failure puts it back.
    onMutate: async ({ routeId, saved }) => {
      await client.cancelQueries({ queryKey: accountKeys.favoriteIds });
      const previous = client.getQueryData<string[]>(accountKeys.favoriteIds);
      client.setQueryData<string[]>(accountKeys.favoriteIds, (ids = []) =>
        saved ? [...new Set([...ids, routeId])] : ids.filter((id) => id !== routeId),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) client.setQueryData(accountKeys.favoriteIds, context.previous);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: accountKeys.favoriteIds });
      void client.invalidateQueries({ queryKey: accountKeys.favorites });
    },
  });
}
