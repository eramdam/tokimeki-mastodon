import clsx from "clsx";
import parse from "html-react-parser";
import { useMemo, useState } from "react";

import { useMastodon } from "../helpers/mastodonContext";
import {
  goToNextAccount,
  keepAccount,
  unfollowAccount,
} from "../store/actions";
import {
  useCurrentAccount,
  useCurrentAccountRelationship,
  useCurrentIndex,
  useFilteredFollowings,
  useFollowings,
  useSettings,
} from "../store/selectors";
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

interface ReviewerProps {
  onFinished: () => void;
}

export function Reviewer(props: ReviewerProps) {
  const followingIndex = useCurrentIndex();
  const currentAccount = useCurrentAccount();
  const currentAccountRelationship = useCurrentAccountRelationship();
  const filteredFollowings = useFilteredFollowings();
  const followings = useFollowings();
  const { client } = useMastodon();
  const {
    showBio: initialShowBio,
    showFollowLabel,
    showNote: initialShowNote,
  } = useSettings();
  const [showBio, setShowBio] = useState(initialShowBio);
  const [showNote, setShowNote] = useState(initialShowNote);
  const [animationState, setAnimated] = useState(AnimationState.Idle);
  const isVisible = animationState === AnimationState.Idle;

  const parseOptions = useMemo(
    () =>
      getParserOptions({
        emojiArray: currentAccount?.emojis || [],
        classNames: {
          p: "inline-block first-of-type:mt-0 text-sm",
        },
      }),
    [currentAccount?.emojis]
  );

  const onNextClick = async () => {
    const shouldUnfollow = animationState === AnimationState.Unfollow;
    if (currentAccount) {
      if (shouldUnfollow && client) {
        console.log("Will unfollow", currentAccount.acct);
        if (process.env.NODE_ENV !== "development") {
          await client.v1.accounts.unfollow(currentAccount.id);
        }
        unfollowAccount(currentAccount.id);
      } else {
        keepAccount(currentAccount.id);
      }
    }

    setAnimated(AnimationState.Hidden);

    if (
      filteredFollowings.length < 1 ||
      (currentAccount &&
        currentAccount.id === followings[followings.length - 1]?.id)
    ) {
      props.onFinished();
      return;
    }

    goToNextAccount();
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
            {renderWithEmoji(
              currentAccount.emojis,
              currentAccount.displayName.trim() || currentAccount.acct
            )}
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
            {renderWithEmoji(
              currentAccount.emojis,
              currentAccount.displayName.trim() || currentAccount.acct
            )}
          </strong>{" "}
          for all the toots you&apos;ve enjoyed before.{" "}
        </>
      );
    }

    if (animationState === AnimationState.Hidden) {
      return <>Loading...</>;
    }

    return <>Do their toots still spark joy or feel important to you?</>;
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
    if (followingIndex === followings.length - 1) {
      return "Last but not least, ";
    }

    return followingIndex === 0 ? "Starting with " : `#${followingIndex + 1}: `;
  };

  if (followings?.length === 0) {
    return (
      <Block>
        <p className="prose dark:prose-invert">Loading your followings</p>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => {
            return (
              <div
                key={i}
                className="h-3 w-3 animate-pulse rounded-full bg-black/20 dark:bg-white/20"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            );
          })}
        </div>
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
            <div className="flex w-full items-center justify-between">
              <p className="prose break-words text-left leading-normal dark:prose-invert">
                {renderTitle()}
                {currentAccount.displayName && (
                  <strong className="inline-block">
                    {renderWithEmoji(
                      currentAccount.emojis,
                      currentAccount.displayName.trim()
                    )}
                  </strong>
                )}{" "}
                <a
                  href={currentAccount.url}
                  target="_blank"
                  className="text-sm text-neutral-400 hover:underline"
                  rel="noreferrer noopener"
                >
                  @{currentAccount.acct}
                </a>
                !{" "}
                {showFollowLabel && (
                  <span className="rounded-md bg-violet-500 py-[4px] px-2 align-middle text-[10px] uppercase text-white dark:bg-violet-800">
                    Follows you
                  </span>
                )}
              </p>
            </div>
          </>
        )}

        {isVisible && (
          <div className="flex gap-2">
            {currentAccount?.note && (
              <SmallButton
                variant="secondary"
                onPress={() => {
                  setShowBio((p) => !p);
                }}
              >
                {showBio ? "Hide bio" : "Show bio"}
              </SmallButton>
            )}
            {currentAccountRelationship?.note && (
              <SmallButton
                variant="secondary"
                onPress={() => {
                  setShowNote((p) => !p);
                }}
              >
                {showNote ? "Hide note" : "Show note"}
              </SmallButton>
            )}
          </div>
        )}
        {showBio && currentAccount.note && (
          <div className="prose w-full rounded-md border-[1px] border-black/30 bg-black/10 p-2 leading-normal dark:bg-black/50 dark:prose-invert">
            <strong className="text-sm">Bio:</strong>{" "}
            {parse(currentAccount.note, parseOptions)}
          </div>
        )}
        {showNote && currentAccountRelationship?.note && (
          <div className="prose w-full rounded-md border-[1px] border-black/30 bg-yellow-400/10 p-2 leading-normal dark:prose-invert">
            <strong className="text-sm">Note:</strong>{" "}
            <p className="mt-0 inline-block text-sm">
              {parse(currentAccountRelationship.note, parseOptions)}
            </p>
          </div>
        )}
        <div className="prose leading-normal dark:prose-invert">
          {renderPrompt()}
        </div>
        <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
          {renderFooter()}
        </div>
      </Block>
    </div>
  );
}
