import { shuffle } from "lodash-es";
import { useMemo } from "react";

import { SortOrders, usePersistedStore } from "./index";

export const useIsFinished = () =>
  usePersistedStore((state) => state.isFinished);
export const useUserAccountId = () =>
  usePersistedStore((state) => state.userAccountId);
export const useUserAccountUsername = () =>
  usePersistedStore((state) => state.userAccountUsername);
export const useKeptIds = () => usePersistedStore((state) => state.keptIds);
export const useRemoveAccountIds = () =>
  usePersistedStore((state) => state.removedAccountIds);
export const useSettings = () => usePersistedStore((state) => state.settings);
export const useStartCount = () =>
  usePersistedStore((state) => state.startCount || 0);
export const useInstanceUrl = () =>
  usePersistedStore((state) => state.instanceUrl?.replace(/\/$/, ""));
export const useAccessToken = () =>
  usePersistedStore((state) => state.accessToken);
export const useOAuthCodeDependencies = () =>
  usePersistedStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  });

export const useAccountIds = () =>
  usePersistedStore((state) => state.accountIds);
export const useBaseFollowings = () =>
  usePersistedStore((state) => state.baseAccountIds);
export const useFilteredFollowings = () => {
  const baseFollowings = useAccountIds();
  const keptIds = useKeptIds();
  const unfollowedIds = useRemoveAccountIds();

  return useMemo(
    () => filterFollowingIds(baseFollowings, keptIds, unfollowedIds),
    [baseFollowings, keptIds, unfollowedIds],
  );
};

export const useReviewType = () =>
  usePersistedStore((state) => state.reviewType);

export const useCurrentAccountListIds = () =>
  usePersistedStore((state) => state.currentAccountListIds);
export const useCurrentAccountRelationship = () =>
  usePersistedStore((state) => state.currentRelationship);
export const useCurrentAccount = () =>
  usePersistedStore((state) => state.currentAccount);
export const useCurrentIndex = () => {
  const currentAccount = useCurrentAccount();
  const followings = useAccountIds();

  if (!currentAccount) {
    return 0;
  }

  return followings.indexOf(currentAccount.id);
};
export const useIsFetching = () =>
  usePersistedStore((state) => state.isFetching);
export const useKeptAccounts = () => {
  const baseFollowings = useAccountIds();
  const keptIds = useKeptIds();

  return useMemo(
    () => baseFollowings.filter((a) => keptIds?.includes(a)),
    [baseFollowings, keptIds],
  );
};

export const useLists = () => usePersistedStore((state) => state.lists);
export const useListById = (id: string | undefined) => {
  return usePersistedStore((state) => state.lists.find((l) => l.id === id));
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
export function sortAccounts(array: string[], sortOrder: SortOrders) {
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
