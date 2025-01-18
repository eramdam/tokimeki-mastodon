import { shuffle } from "lodash-es";
import { useMemo } from "react";

import { SortOrders, useMainStore } from "./index";
import { useMastodonStore } from "./mastodon";

export const useIsFinished = () => useMainStore((state) => state.isFinished);
export const useAccountId = () => useMastodonStore((state) => state.accountId);
export const useAccountUsername = () =>
  useMastodonStore((state) => state.accountUsername);
export const useKeptIds = () => useMastodonStore((state) => state.keptIds);
export const useUnfollowedIds = () =>
  useMastodonStore((state) => state.unfollowedIds);
export const useSettings = () => useMainStore((state) => state.settings);
export const useStartCount = () =>
  useMastodonStore((state) => state.startCount || 0);
export const useInstanceUrl = () =>
  useMastodonStore((state) => state.instanceUrl?.replace(/\/$/, ""));
export const useAccessToken = () =>
  useMastodonStore((state) => state.accessToken);
export const useOAuthCodeDependencies = () =>
  useMastodonStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  });

export const useFollowingIds = () =>
  useMastodonStore((state) => state.followingIds);
export const useBaseFollowings = () =>
  useMastodonStore((state) => state.baseFollowingIds);
export const useFilteredFollowings = () => {
  const baseFollowings = useFollowingIds();
  const keptIds = useKeptIds();
  const unfollowedIds = useUnfollowedIds();

  return useMemo(
    () => filterFollowingIds(baseFollowings, keptIds, unfollowedIds),
    [baseFollowings, keptIds, unfollowedIds],
  );
};

export const useCurrentAccountListIds = () =>
  useMastodonStore((state) => state.currentAccountListIds);
export const useCurrentAccountRelationship = () =>
  useMastodonStore((state) => state.currentRelationship);
export const useCurrentAccount = () =>
  useMastodonStore((state) => state.currentAccount);
export const useCurrentIndex = () => {
  const currentAccount = useCurrentAccount();
  const followings = useFollowingIds();

  if (!currentAccount) {
    return 0;
  }

  return followings.indexOf(currentAccount.id);
};
export const useIsFetching = () => useMainStore((state) => state.isFetching);
export const useKeptAccounts = () => {
  const baseFollowings = useFollowingIds();
  const keptIds = useKeptIds();

  return useMemo(
    () => baseFollowings.filter((a) => keptIds?.includes(a)),
    [baseFollowings, keptIds],
  );
};

export const useLists = () => useMastodonStore((state) => state.lists);
export const useListById = (id: string | undefined) => {
  return useMastodonStore((state) => state.lists.find((l) => l.id === id));
};

/*
 * Helpers.
 */
export function filterFollowingIds(
  array: string[],
  keptIds: string[] | null | undefined,
  unfollowedIds: string[] | null | undefined,
) {
  return array.filter((a) => {
    return !keptIds?.includes(a) && !unfollowedIds?.includes(a);
  });
}
export function sortFollowings(array: string[], sortOrder: SortOrders) {
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
