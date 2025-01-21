import { compact } from "lodash-es";
import { useCallback, useState } from "react";
import { useMastodon } from "../helpers/mastodonContext";
import type { TokimekiAccount } from "../store/common";
import {
  goToNextMastodonAccount,
  useMastodonCurrentAccount,
  useMastodonCurrentAccountRelationship,
  useMastodonCurrentIndex,
  useMastodonFilteredFollowings,
  useMastodonFollowingIds,
  useMastodonInstanceUrl,
  useMastodonListById,
} from "../store/mastodonStore";
import { Reviewer } from "./reviewer";

interface MastodonReviewerProps {
  onFinished: () => void;
}

export function MastodonReviewer(props: MastodonReviewerProps) {
  const currentAccount = useMastodonCurrentAccount();
  const currentAccountRelationship = useMastodonCurrentAccountRelationship();
  const filteredFollowings = useMastodonFilteredFollowings();
  const followings = useMastodonFollowingIds();
  const followingIndex = useMastodonCurrentIndex();
  const { client } = useMastodon();
  const instanceUrl = useMastodonInstanceUrl();
  const [addedToListId, setAddedToListId] = useState<string | undefined>(
    undefined,
  );
  const list = useMastodonListById(addedToListId);

  const unfollowAccount = useCallback(async (accountId: string) => {
    if (!client) {
      return;
    }
    await client.v1.accounts.$select(accountId).unfollow();
  }, []);

  const addToList = useCallback(
    async (listId: string, account: TokimekiAccount) => {
      if (!client) {
        return;
      }
      await client.v1.lists.$select(listId).accounts.create({
        accountIds: compact([account.id ?? ""]),
      });
    },
    [],
  );

  const goToNextAccount = useCallback(
    async (currentAccount: TokimekiAccount) => {
      if (!client) {
        return;
      }
      await goToNextMastodonAccount(client, currentAccount);
    },
    [],
  );

  return (
    <Reviewer
      onFinished={props.onFinished}
      currentAccount={currentAccount}
      currentAccountRelationship={currentAccountRelationship}
      filteredFollowings={filteredFollowings}
      followings={followings}
      unfollowAccount={unfollowAccount}
      addToList={addToList}
      goToNextAccount={goToNextAccount}
      followingIndex={followingIndex}
      makeAccountUrl={() => `${instanceUrl}/@${currentAccount?.acct}`}
      listName={list?.title}
      setAddedToListId={setAddedToListId}
    />
  );
}
