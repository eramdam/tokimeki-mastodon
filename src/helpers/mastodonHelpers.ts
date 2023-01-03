import { shuffle, uniq } from "lodash-es";
import type { mastodon } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMastodon } from "./mastodonContext";
import {
  getStoredItem,
  setStoredItem,
  SortOrders,
  useItemFromLocalForage,
} from "./storageHelpers";

export type UseMastoFollowingsListProps = ReturnType<
  typeof useMastoFollowingsList
>;

export function useMastoFollowingsList() {
  const { client, account } = useMastodon();
  const [followingsPage, setFollowingsPage] = useState<mastodon.v1.Account[]>(
    []
  );
  const [followingsFromServer, setFollowingsFromServer] = useState<
    mastodon.v1.Account[]
  >([]);
  const accountId = useMemo(() => account?.id, [account]);
  const [currentAccount, setCurrentAccount] = useState<
    mastodon.v1.Account | undefined
  >(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const keptIds = useItemFromLocalForage("keptIds");
  const unfollowedIds = useItemFromLocalForage("unfollowedIds");
  const sortOrder = useItemFromLocalForage("sortOrder");
  const filteredAccounts = useMemo(() => {
    return followingsPage.filter((a) => {
      return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
    });
  }, [followingsPage, keptIds, unfollowedIds]);
  const followingIndex = useMemo(() => {
    const curr = currentAccount || followingsPage[0];
    console.log({ curr, followingsPage });
    if (!curr) {
      return 0;
    }
    return followingsPage.findIndex((a) => a.id === curr.id);
  }, [currentAccount, followingsPage]);

  const updateSortOrder = useCallback(
    (newOrder: SortOrders) => {
      setStoredItem("sortOrder", newOrder);
      console.log({ newOrder, followingsFromServer });

      const newFollowings = sortFollowings(followingsFromServer, newOrder);
      setFollowingsPage(newFollowings);
      setCurrentAccount(followingsPage[0]);
    },
    [followingsFromServer, followingsPage]
  );

  const goToNextAccount = useCallback(async () => {
    const currentIndex = followingsPage.findIndex(
      (a) => a.id === currentAccount?.id
    );

    if (currentIndex === -1) {
      setCurrentAccount(followingsPage[0]);
      return;
    }

    setCurrentAccount(followingsPage[currentIndex + 1]);
  }, [currentAccount?.id, followingsPage]);

  useEffect(() => {
    if (!client || isFetching) {
      return;
    }

    async function fetchFollowings() {
      if (!accountId || !client) {
        return [];
      }

      setIsFetching(true);
      const accounts: mastodon.v1.Account[] = [];

      if (accounts.length === 0) {
        for await (const followings of client.v1.accounts.listFollowing(
          accountId,
          {
            limit: 80,
          }
        )) {
          accounts.push(...followings);
        }
      }

      if (process.env.NODE_ENV === "development") {
        sessionStorage.setItem("followings", JSON.stringify(accounts));
      }

      return accounts;
    }

    fetchFollowings().then(async (res) => {
      setFollowingsFromServer(res);
      const keptIds = await getStoredItem("keptIds");
      const unfollowedIds = await getStoredItem("unfollowedIds");
      const filteredResults = filterFollowings(res, keptIds, unfollowedIds);
      setFollowingsPage(sortFollowings(res, sortOrder || SortOrders.OLDEST));
      setCurrentAccount(filteredResults[0]);
    });
  }, [accountId, client, isFetching, sortOrder]);

  return {
    currentAccount,
    goToNextAccount,
    filteredAccounts,
    followingsPage,
    followingIndex,
    updateSortOrder,
    followingsFromServer,
  };
}

function filterFollowings(
  array: mastodon.v1.Account[],
  keptIds: string[] | null,
  unfollowedIds: string[] | null
) {
  return array.filter((a) => {
    return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
  });
}

function sortFollowings(array: mastodon.v1.Account[], sortOrder: SortOrders) {
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
