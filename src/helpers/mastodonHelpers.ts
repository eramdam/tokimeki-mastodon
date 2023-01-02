import { uniq } from "lodash-es";
import type { mastodon } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMastodon } from "./mastodonContext";
import {
    getStoredItem,
    setStoredItem
} from "./storageHelpers";

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

  const goToNextAccount = useCallback(async () => {
    setFollowingIndex((p) => p + 1);
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

      const keptIds = (await getStoredItem("keptIds")) || [];
      const unfollowedIds = (await getStoredItem("unfollowedIds")) || [];

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

      return accounts.filter((a) => {
        return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
      });
    }

    fetchFollowings().then((res) => {
      setFollowingsPage(res);
      setCurrentAccount(res[0]);
    });
  }, [accountId, client, isFetching]);

  return {
    currentAccount,
    goToNextAccount,
    followingsPage,
    followingIndex,
  };
}
