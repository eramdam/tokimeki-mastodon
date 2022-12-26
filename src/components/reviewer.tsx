import type { mastodon } from "masto";
import { login } from "masto";
import { useCallback, useEffect, useState } from "react";
import { getFollowings } from "../helpers/mastodonHelpers";
import { useItemFromLocalForage } from "../helpers/storageHelpers";
import { Button } from "./button";
import { FeedWidget } from "./feedWidget";
import { Block } from "./main";

export function Reviewer() {
  const masto = useMastoClient();
  const [count, setCount] = useState(0);
  const [accounts, setAccounts] = useState<mastodon.v1.Account[]>([]);
  const [showBio, setShowBio] = useState(false);

  const onMount = useCallback(async () => {
    if (!masto) {
      return;
    }

    if (accounts.length > 0) {
      return;
    }

    const following = await getFollowings(masto);
    setAccounts(following);
  }, [accounts.length, masto]);

  useEffect(() => {
    onMount();
  }, [masto, onMount]);

  if (accounts.length === 0) {
    return <div>Loading...</div>;
  }

  const firstAccount = accounts[0];

  if (!firstAccount) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <Block className="m-auto inline-flex p-0">
          <FeedWidget
            width={400}
            height={800}
            theme="light"
            showBoosts={true}
            showReplies={false}
            showHeader={showBio}
            url={firstAccount.url}
          />
        </Block>
      </div>
      <Block className="">
        <p>
          Starting with <strong>{firstAccount.displayName}</strong>{" "}
          <span className="text-sm text-neutral-400">
            @{firstAccount.acct}!
          </span>
        </p>
        <p>Do posts still spark joy or feel important to you?</p>
        <div className="mt-2 -mb-8 inline-flex gap-4">
          <Button>Unfollow</Button>
          <Button>Keep</Button>
        </div>
      </Block>
    </>
  );
}

function useMastoClient() {
  const accessToken = useItemFromLocalForage<string>("accessToken");
  const instanceUrl = useItemFromLocalForage<string>("instanceUrl");
  const [masto, setMasto] = useState<mastodon.Client | undefined>();

  useEffect(() => {
    if (!accessToken || !instanceUrl) {
      return;
    }

    login({
      url: instanceUrl,
      accessToken: accessToken,
    }).then((mastoClient) => {
      setMasto(mastoClient);
      console.log({ mastoClient });
    });
  }, [accessToken, instanceUrl]);

  return masto;
}
