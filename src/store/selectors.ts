import { shuffle } from "lodash-es";
import type { mastodon } from "masto";
import { useMemo } from "react";
import shallow from "zustand/shallow";

import { SortOrders, usePersistedStore } from "./index";

export const useIsFinished = () =>
  usePersistedStore((state) => state.isFinished);
export const useAccountId = () => usePersistedStore((state) => state.accountId);
export const useAccountUsername = () =>
  usePersistedStore((state) => state.accountUsername);
export const useKeptIds = () => usePersistedStore((state) => state.keptIds);
export const useUnfollowedIds = () =>
  usePersistedStore((state) => state.unfollowedIds);
export const useSettings = () => usePersistedStore((state) => state.settings);
export const useStartCount = () =>
  usePersistedStore((state) => state.startCount || 0);
export const useInstanceUrl = () =>
  usePersistedStore((state) => state.instanceUrl);
export const useAccessToken = () =>
  usePersistedStore((state) => state.accessToken);
export const useOAuthCodeDependencies = () =>
  usePersistedStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  }, shallow);

export const useFollowingIds = () =>
  usePersistedStore((state) => state.followingIds);
export const useBaseFollowings = () =>
  usePersistedStore((state) => state.baseFollowings);
export const useFilteredFollowings = () => {
  const baseFollowings = useFollowingIds();
  const keptIds = useKeptIds();
  const unfollowedIds = useUnfollowedIds();

  return useMemo(
    () => filterFollowingIds(baseFollowings, keptIds, unfollowedIds),
    [baseFollowings, keptIds, unfollowedIds]
  );
};
export const useCurrentAccount = () => {
  const currentIndex = useCurrentIndex();
  const followingIds = useFollowingIds();
  const targetId = followingIds[currentIndex] || followingIds[0];
  const followings = useBaseFollowings();

  return useMemo(
    () => followings.find((a) => a.id === targetId),
    [followings, targetId]
  );
};
export const useRelationships = () =>
  usePersistedStore((state) => state.relationships);
export const useCurrentAccountRelationship = () => {
  const currentAccount = useCurrentAccount();
  const relationships = useRelationships();

  if (!currentAccount) {
    return undefined;
  }

  return relationships[currentAccount.id];
};
export const useCurrentIndex = () =>
  usePersistedStore((state) => state.currentIndex);
export const useIsFetching = () =>
  usePersistedStore((state) => state.isFetching);
export const useKeptAccounts = () => {
  const baseFollowings = useFollowingIds();
  const keptIds = useKeptIds();

  return useMemo(
    () => baseFollowings.filter((a) => keptIds?.includes(a)),
    [baseFollowings, keptIds]
  );
};
/*
 * Helpers.
 */
function filterFollowingIds(
  array: string[],
  keptIds: string[] | null | undefined,
  unfollowedIds: string[] | null | undefined
) {
  return array.filter((a) => {
    return !keptIds?.includes(a) && !unfollowedIds?.includes(a);
  });
}
export function sortFollowings(array: { id: string }[], sortOrder: SortOrders) {
  switch (sortOrder) {
    case SortOrders.NEWEST: {
      return array;
    }
    case SortOrders.OLDEST: {
      const newArray = [...array];
      newArray.reverse();
      return newArray;
    }
    case SortOrders.RANDOM: {
      return shuffle([...array]);
    }
  }
}
