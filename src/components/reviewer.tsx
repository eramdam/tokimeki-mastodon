import clsx from "clsx";
import parse from "html-react-parser";
import { uniq } from "lodash-es";
import { useMemo, useState } from "react";

import { delayAsync } from "../helpers/asyncHelpers";
import { useMastodon } from "../helpers/mastodonContext";
import type { UseMastoFollowingsListProps } from "../helpers/mastodonHelpers";
import { getStoredItem, setStoredItem } from "../helpers/storageHelpers";
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

interface ReviewerProps extends UseMastoFollowingsListProps {
  onFinished: () => void;
}

export function Reviewer(props: ReviewerProps) {
  const { currentAccount, goToNextAccount, filteredAccounts, followingIndex } =
    props;
  const { client } = useMastodon();
  const [showBio, setShowBio] = useState(false);
  const [animationState, setAnimated] = useState(AnimationState.Idle);

  const parseOptions = useMemo(
    () => getParserOptions(currentAccount?.emojis || []),
    [currentAccount?.emojis]
  );

  const onNextClick = async () => {
    const keptIds = await getStoredItem("keptIds");
    const unfollowedIds = await getStoredItem("unfollowedIds");

    const shouldUnfollow = animationState === AnimationState.Unfollow;
    if (currentAccount) {
      if (shouldUnfollow && client) {
        console.log("Will unfollow", currentAccount.acct);
        if (process.env.NODE_ENV !== "development") {
          await client.v1.accounts.unfollow(currentAccount.id);
        }
        setStoredItem(
          "unfollowedIds",
          uniq([...(unfollowedIds || []), currentAccount.id])
        );
      } else {
        setStoredItem("keptIds", uniq([...(keptIds || []), currentAccount.id]));
      }
    }

    setAnimated(AnimationState.Hidden);

    if (filteredAccounts.length <= 1) {
      props.onFinished();
      return;
    }

    await goToNextAccount();
    await delayAsync(500);
    setAnimated(AnimationState.Idle);
  };

  function renderPrompt() {
    if (!currentAccount) {
      return null;
    }
    if (animationState === AnimationState.Keep) {
      return (
        <>
          Glad to hear{" "}
          <strong>
            {renderWithEmoji(currentAccount.emojis, currentAccount.displayName)}
          </strong>
          &apos;s toots are still important to you.
        </>
      );
    }

    if (animationState === AnimationState.Unfollow) {
      return (
        <>
          Great, unfollowed! Let&apos;s thank{" "}
          <strong>
            {renderWithEmoji(currentAccount.emojis, currentAccount.displayName)}
          </strong>{" "}
          for all the posts you&apos;ve enjoyed before.{" "}
        </>
      );
    }

    if (animationState === AnimationState.Hidden) {
      return <>Loading...</>;
    }

    return <>Do their posts still spark joy or feel important to you?</>;
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
        <Button onPress={onNextClick} variant="secondary">
          Next
        </Button>
      </>
    );
  }

  const renderTitle = () => {
    if (followingIndex === filteredAccounts.length - 1) {
      return "Last but not least, ";
    }

    return followingIndex === 0 ? "Starting with " : `#${followingIndex + 1}: `;
  };

  if (filteredAccounts?.length === 0) {
    return (
      <Block>
        <p className="prose dark:prose-invert">Loading your followings...</p>
      </Block>
    );
  }

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="flex max-h-full flex-1 flex-shrink flex-col items-center">
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
        ></FeedWidget>
      </Block>
      <Block className="mt-0 flex w-3/4 flex-shrink-0 flex-col items-start">
        {animationState === AnimationState.Idle && (
          <>
            <div className="flex w-full items-center justify-between ">
              <p className="prose break-words text-left leading-tight dark:prose-invert">
                {renderTitle()}
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
                  @{currentAccount.acct}
                </a>
                !
              </p>
              <SmallButton
                variant="secondary"
                onPress={() => setShowBio((p) => !p)}
              >
                {showBio ? "Hide bio" : "Show bio"}
              </SmallButton>
            </div>
            {showBio && (
              <div className="prose leading-tight dark:prose-invert">
                {parse(currentAccount.note, parseOptions)}
              </div>
            )}
          </>
        )}
        <div className="prose leading-tight dark:prose-invert">
          {renderPrompt()}
        </div>
        <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
          {renderFooter()}
        </div>
      </Block>
    </div>
  );
}
