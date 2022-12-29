import type { mastodon } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMastodon } from "./mastodonContext";

export function useMastoFollowingsList() {
  const { client, account } = useMastodon();
  const [followingsPage, setFollowingsPage] = useState<mastodon.v1.Account[]>(
    []
  );
  const accountId = useMemo(() => account?.id, [account]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nextParams, setNextParams] = useState<any>(undefined);
  const [currentAccount, setCurrentAccount] = useState<
    mastodon.v1.Account | undefined
  >(undefined);
  const [followingIndex, setFollowingIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const fetchFollowings = useCallback(async () => {
    if (!accountId || !client) {
      return [];
    }
    setIsFetching(true);

    const followingsPromise = client.v1.accounts.listFollowing(
      accountId,
      nextParams ?? {
        limit: 2,
      }
    );

    const followings = await followingsPromise;
    // @ts-expect-error committing a TS crime until https://github.com/neet/masto.js/issues/775 is fixed.
    setNextParams(followingsPromise.nextParams);

    return followings;
  }, [accountId, client, nextParams]);

  const goToNextAccount = useCallback(async () => {
    setFollowingIndex((p) => p + 1);
    const currentIndex = followingsPage.findIndex(
      (a) => a.id === currentAccount?.id
    );

    if (currentIndex === -1) {
      setCurrentAccount(followingsPage[0]);
      return;
    }

    if (currentIndex === followingsPage.length - 1) {
      const nextFollowings = await fetchFollowings();

      setFollowingsPage(nextFollowings);
      setCurrentAccount(nextFollowings[0]);
      return;
    }

    setCurrentAccount(followingsPage[currentIndex + 1]);
  }, [currentAccount?.id, fetchFollowings, followingsPage]);

  useEffect(() => {
    if (!client || isFetching) {
      return;
    }

    fetchFollowings().then((res) => {
      setFollowingsPage(res);
      setCurrentAccount(res[0]);
    });
  }, [client, fetchFollowings, isFetching]);

  return {
    currentAccount,
    goToNextAccount,
    followingsPage,
    followingIndex,
  };
}
