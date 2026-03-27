import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApprovalStatus,
  OffenderRecord,
  UserApprovalInfo,
  Variant_avoid_safe_unknown,
  WatchlistEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
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
      return actor.isEliteTierSubscriber();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-approved"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  return useQuery<UserApprovalInfo[]>({
    queryKey: ["list-approvals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-approvals"] });
    },
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

export function useOffenders() {
  const { actor, isFetching } = useActor();
  return useQuery<OffenderRecord[]>({
    queryKey: ["offenders"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getOffenders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOffender() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: OffenderRecord) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).addOffender(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offenders"] });
    },
  });
}

export function useRemoveOffender() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).removeOffender(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offenders"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: import("../backend.d").Profile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
