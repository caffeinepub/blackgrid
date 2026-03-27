import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Variant_avoid_safe_unknown, WatchlistEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAreaIncidents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["area-incidents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAreaIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadAlertCount() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["unread-alerts"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadAlertCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsEliteSubscriber() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-elite"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isEliteSubscriber();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWatchlistEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: WatchlistEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.addWatchlistEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useRemoveWatchlistEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeWatchlistEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useUpdateWatchlistTag() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      newTag,
    }: { entryId: bigint; newTag: Variant_avoid_safe_unknown }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateWatchlistTag(entryId, newTag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}
