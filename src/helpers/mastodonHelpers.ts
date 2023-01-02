import type { mastodon } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMastodon } from "./mastodonContext";
import { setStoredItem, useItemFromLocalForage } from "./storageHelpers";

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
    if (!client || isFetching || keptIds || unfollowedIds) {
      return;
    }

    async function fetchFollowings() {
      if (!accountId || !client) {
        return [];
      }
      setIsFetching(true);
      const accounts: mastodon.v1.Account[] =
        process.env.NODE_ENV === "development"
          ? safeJsonParse(sessionStorage.getItem("followings") || "") || []
          : [];

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

      setStoredItem(
        "followingIds",
        accounts.map((a) => a.id)
      );

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
  }, [accountId, client, isFetching, keptIds, unfollowedIds]);

  return {
    currentAccount,
    goToNextAccount,
    followingsPage,
    followingIndex,
  };
}

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}
