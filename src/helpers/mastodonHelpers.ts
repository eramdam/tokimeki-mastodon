import { uniq } from "lodash-es";
import type { mastodon } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMastodon } from "./mastodonContext";
import {
  getStoredItem,
  setStoredItem,
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
  const accountId = useMemo(() => account?.id, [account]);
  const [currentAccount, setCurrentAccount] = useState<
    mastodon.v1.Account | undefined
  >(undefined);
  const [followingIndex, setFollowingIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const keptIds = useItemFromLocalForage("keptIds");
  const unfollowedIds = useItemFromLocalForage("unfollowedIds");
  const filteredAccounts = useMemo(() => {
    return followingsPage.filter((a) => {
      return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
    });
  }, [followingsPage, keptIds, unfollowedIds]);

  const goToNextAccount = useCallback(async () => {
    const currentIndex = followingsPage.findIndex(
      (a) => a.id === currentAccount?.id
    );

    if (currentIndex === -1) {
      setCurrentAccount(followingsPage[0]);
      setFollowingIndex(0);
      return;
    }

    setCurrentAccount(followingsPage[currentIndex + 1]);
    setFollowingIndex(currentIndex + 1);
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

      setStoredItem("followingIds", uniq(accounts.map((a) => a.id)));

      if (process.env.NODE_ENV === "development") {
        sessionStorage.setItem("followings", JSON.stringify(accounts));
      }

      return accounts;
    }

    fetchFollowings().then(async (res) => {
      const keptIds = await getStoredItem("keptIds");
      const unfollowedIds = await getStoredItem("unfollowedIds");
      setFollowingsPage(res);
      setCurrentAccount(
        res.filter((a) => {
          return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
        })[0]
      );
    });
  }, [accountId, client, isFetching]);

  return {
    currentAccount,
    filteredAccounts,
    goToNextAccount,
    followingsPage,
    followingIndex,
  };
}
