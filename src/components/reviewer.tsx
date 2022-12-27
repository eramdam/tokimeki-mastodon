import clsx from "clsx";
import parse from "html-react-parser";
import type { mastodon } from "masto";
import { login } from "masto";
import { useCallback, useEffect, useMemo, useState } from "react";
import { delayAsync } from "../helpers/asyncHelpers";
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
  Hidden,
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

  function renderPrompt() {
    if (!currentAccount) {
      return null;
    }
    if (animationState === AnimationState.Keep) {
      return (
        <p className="prose leading-tight">
          Glad to hear{" "}
          <strong>
            {renderWithEmoji(currentAccount.emojis, currentAccount.displayName)}
          </strong>
          &apos;s toots are still important to you.
        </p>
      );
    }

    if (animationState === AnimationState.Unfollow) {
      return (
        <p className="prose leading-tight">
          Great, unfollowed! Let&apos;s thank{" "}
          <strong>
            {renderWithEmoji(currentAccount.emojis, currentAccount.displayName)}
          </strong>{" "}
          for all the posts you&apos;ve enjoyed before.{" "}
        </p>
      );
    }

    if (animationState === AnimationState.Hidden) {
      return <p className="prose leading-tight">Loading...</p>;
    }

    return (
      <p className="prose leading-tight">
        Do their posts still spark joy or feel important to you?
      </p>
    );
  }

  function renderFooter() {
    if (!currentAccount) {
      return null;
    }

    if (animationState === AnimationState.Idle) {
      return (
        <>
          <Button
            variant="secondary"
            onPress={() => {
              setAnimated(AnimationState.Unfollow);
            }}
          >
            Unfollow
          </Button>
          <Button
            onPress={() => {
              setAnimated(AnimationState.Keep);
            }}
            variant="secondary"
          >
            Keep
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          variant="secondary"
          onPress={() => {
            setAnimated(AnimationState.Idle);
          }}
        >
          Undo
        </Button>
        <Button
          onPress={async () => {
            setAnimated(AnimationState.Hidden);
            setIndex((p) => p + 1);
            await delayAsync(600);
            setAnimated(AnimationState.Idle);
          }}
          variant="secondary"
        >
          Next
        </Button>
      </>
    );
  }

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
          "opacity-0 transition-all duration-[250ms] ease-in-out",
          animationState === AnimationState.Hidden && "scale-0",
          animationState === AnimationState.Idle && "scale-1 opacity-100",
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
        {animationState === AnimationState.Idle && (
          <>
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
          </>
        )}
        <p className="prose leading-tight">{renderPrompt()}</p>
        <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
          {renderFooter()}
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
