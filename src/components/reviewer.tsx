import clsx from "clsx";
import parse from "html-react-parser";
import type { mastodon } from "masto";
import { login } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFollowings } from "../helpers/mastodonHelpers";
import { useItemFromLocalForage } from "../helpers/storageHelpers";
import { Button, SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import { FeedWidget } from "./feedWidget";
import { getParserOptions } from "./htmlReactParserOptions";
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
  const currentAccount = accounts[index];
  const parseOptions = useMemo(
    () => getParserOptions(currentAccount?.emojis || []),
    [currentAccount?.emojis]
  );

  if (accounts.length === 0 || !masto) {
    return (
      <Block>
        <div>Loading...</div>
      </Block>
    );
  }

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="flex max-h-full flex-1 flex-shrink flex-col items-center ">
      <Block
        className={clsx(
          "m-auto inline-flex flex-1 flex-shrink overflow-hidden p-0",
          "w-[400px]",
          "scale-1 transition-all duration-[250ms] ease-in-out",
          animationState === AnimationState.Keep &&
            "translate-x-[20%] translate-y-[200px] rotate-[10deg] scale-[0.5] opacity-0",
          animationState === AnimationState.Unfollow &&
            "translate-x-[-20%] translate-y-[200px] rotate-[-10deg] scale-[0.5] opacity-0"
        )}
      >
        <FeedWidget
          key={currentAccount.id}
          accountId={currentAccount.id}
          client={masto}
        ></FeedWidget>
      </Block>
      <Block className="mt-0 flex w-3/4 flex-shrink-0 flex-col items-start">
        <div className="flex w-full items-center justify-between ">
          <p className="prose break-words text-left leading-tight">
            {index === 0 ? "Starting with" : `#${index + 1}:`}{" "}
            <strong>
              {renderWithEmoji(
                currentAccount.emojis,
                currentAccount.displayName
              )}
            </strong>{" "}
            <a
              href={currentAccount.url}
              target="_blank"
              className="text-sm text-neutral-400 hover:underline"
              rel="noreferrer noopener"
            >
              @{currentAccount.acct}!
            </a>
          </p>
          <SmallButton
            variant="secondary"
            onPress={() => setShowBio((p) => !p)}
          >
            {showBio ? "Hide bio" : "Show bio"}
          </SmallButton>
        </div>
        {showBio && (
          <div className="leading-tight">
            {parse(currentAccount.note, parseOptions)}
          </div>
        )}
        <p className="prose leading-tight">
          Do their posts still spark joy or feel important to you?
        </p>
        <div className="mt-2 -mb-8 inline-flex gap-4">
          <Button
            variant="primary"
            onPress={() => {
              setAnimated(AnimationState.Unfollow);
              setIndex((p) => p + 1);
              setTimeout(() => {
                setAnimated(AnimationState.Idle);
              }, 500);
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
              }, 500);
            }}
            variant="secondary"
          >
            Keep
          </Button>
        </div>
      </Block>
    </div>
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
    });
  }, [accessToken, instanceUrl]);

  return masto;
}
