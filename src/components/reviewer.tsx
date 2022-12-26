import clsx from "clsx";
import type { mastodon } from "masto";
import { login } from "masto";
import { useCallback, useEffect, useState } from "react";
import { getFollowings } from "../helpers/mastodonHelpers";
import { useItemFromLocalForage } from "../helpers/storageHelpers";
import { Button } from "./button";
import { FeedWidget } from "./feedWidget";
import { FeedWidgetIframe } from "./feedWidgetIframe";
import { Block } from "./main";

enum AnimationState {
  Idle,
  Unfollow,
  Keep,
}

export function Reviewer() {
  const masto = useMastoClient();
  const [index, setIndex] = useState(0);
  const [accounts, setAccounts] = useState<mastodon.v1.Account[]>([]);
  const [showBio, setShowBio] = useState(false);
  const [animationState, setAnimated] = useState(AnimationState.Idle);

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

  if (accounts.length === 0 || !masto) {
    return (
      <Block>
        <div>Loading...</div>
      </Block>
    );
  }

  const currentAccount = accounts[index];

  if (!currentAccount) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <Block
          className={clsx(
            "m-auto inline-flex p-0",
            "min-h-[400px]",
            "scale-1 transition-all duration-[250ms] ease-in-out",
            animationState === AnimationState.Keep &&
              "translate-x-[20%] translate-y-[200px] rotate-[10deg] scale-[0.5] opacity-0",
            animationState === AnimationState.Unfollow &&
              "translate-x-[-20%] translate-y-[200px] rotate-[-10deg] scale-[0.5] opacity-0"
          )}
        >
          <FeedWidget accountId={currentAccount.id} client={masto}></FeedWidget>
          {/* <FeedWidgetIframe
            width={400}
            height={800}
            theme="light"
            showBoosts={true}
            showReplies={false}
            showHeader={showBio}
            url={currentAccount.url}
          /> */}
        </Block>
      </div>
      <Block className="">
        <p>
          Starting with <strong>{currentAccount.displayName}</strong>{" "}
          <span className="text-sm text-neutral-400">
            @{currentAccount.acct}!
          </span>
        </p>
        <p>Do their posts still spark joy or feel important to you?</p>
        <div className="mt-2 -mb-8 inline-flex gap-4">
          <Button
            variant="primary"
            onPress={() => {
              setAnimated(AnimationState.Unfollow);
              setIndex((p) => p + 1);
              setTimeout(() => {
                setAnimated(AnimationState.Idle);
              }, 1000);
            }}
          >
            Unfollow
          </Button>
          <Button
            onPress={() => {
              setAnimated(AnimationState.Keep);
              setIndex((p) => p + 1);
              setTimeout(() => {
                setAnimated(AnimationState.Idle);
              }, 1000);
            }}
            variant="secondary"
          >
            Keep
          </Button>
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
