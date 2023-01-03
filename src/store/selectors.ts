import { shuffle } from "lodash-es";
import type { mastodon } from "masto";
import shallow from "zustand/shallow";

import { SortOrders, usePersistedStore } from "./index";

export const useIsFinished = () =>
  usePersistedStore((state) => state.isFinished);
export const useAccount = () => usePersistedStore((state) => state.account);
export const useAccountId = () =>
  usePersistedStore((state) => state.account?.id);
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

export const useFollowings = () =>
  usePersistedStore((state) => state.followings);
export const useFilteredFollowings = () => {
  const baseFollowings = useFollowings();
  const keptIds = useKeptIds();
  const unfollowedIds = useUnfollowedIds();

  return filterFollowings(baseFollowings, keptIds, unfollowedIds);
};
export const useCurrentAccount = () => {
  const currentIndex = useCurrentIndex();
  const followings = useFollowings();

  return followings[currentIndex] || followings[0];
};
export const useCurrentIndex = () =>
  usePersistedStore((state) => state.currentIndex);
export const useIsFetching = () =>
  usePersistedStore((state) => state.isFetching);
export const useKeptAccounts = () => {
  const baseFollowings = useFollowings();
  const keptIds = useKeptIds();

  return baseFollowings.filter((a) => keptIds?.includes(a.id));
};
/*
 * Helpers.
 */
function filterFollowings(
  array: mastodon.v1.Account[],
  keptIds: string[] | null | undefined,
  unfollowedIds: string[] | null | undefined
) {
  return array.filter((a) => {
    return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
  });
}
export function sortFollowings(
  array: mastodon.v1.Account[],
  sortOrder: SortOrders
) {
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
