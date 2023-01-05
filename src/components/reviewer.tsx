import clsx from "clsx";
import { useState } from "react";

import { delayAsync } from "../helpers/asyncHelpers";
import { useMastodon } from "../helpers/mastodonContext";
import {
  goToNextAccount,
  keepAccount,
  setCurrentAccountEmpty,
  unfollowAccount,
} from "../store/actions";
import {
  useCurrentAccount,
  useCurrentAccountRelationship,
  useFilteredFollowings,
  useFollowingIds,
  useSettings,
} from "../store/selectors";
import { Block } from "./block";
import { FeedWidget } from "./feedWidget";
import { FollowingsLoadingIndicator } from "./followingsLoadingIndicator";
import { ReviewerButtons } from "./reviewerButtons";
import { ReviewerFooter } from "./reviewerFooter";
import { ReviewerPrompt } from "./reviewerPrompt";

export enum AnimationState {
  Idle,
  Unfollow,
  Keep,
  Hidden,
}

interface ReviewerProps {
  onFinished: () => void;
}

export function Reviewer(props: ReviewerProps) {
  const currentAccount = useCurrentAccount();
  const currentAccountRelationship = useCurrentAccountRelationship();
  const filteredFollowings = useFilteredFollowings();
  const followings = useFollowingIds();
  const { client } = useMastodon();

  const [animationState, setAnimated] = useState(AnimationState.Idle);
  const isVisible = animationState === AnimationState.Idle;
  const { skipConfirmation } = useSettings();

  const onNextClick = async (forceUnfollow?: boolean) => {
    if (!client || !currentAccount) {
      return;
    }

    const shouldUnfollow =
      forceUnfollow ?? animationState === AnimationState.Unfollow;
    if (currentAccount) {
      if (shouldUnfollow) {
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
        currentAccount.id === followings[followings.length - 1])
    ) {
      props.onFinished();
      return;
    }

    setAnimated(AnimationState.Idle);
    setCurrentAccountEmpty();
    await goToNextAccount(client, currentAccount);
  };

  const onUndoClick = () => setAnimated(AnimationState.Idle);
  const onUnfollowClick = async () => {
    if (skipConfirmation) {
      setAnimated(AnimationState.Hidden);
      await delayAsync(350);
      onNextClick(true);
    } else {
      setAnimated(AnimationState.Unfollow);
    }
  };
  const onKeepClick = async () => {
    if (skipConfirmation) {
      setAnimated(AnimationState.Hidden);
      await delayAsync(350);
      onNextClick(false);
    } else {
      setAnimated(AnimationState.Keep);
    }
  };

  if (followings?.length === 0) {
    return <FollowingsLoadingIndicator />;
  }

  return (
    <div className="flex max-h-full flex-1 flex-shrink flex-col items-center">
      <Block
        className={clsx(
          "m-auto inline-flex flex-1 flex-shrink overflow-hidden p-0",
          "w-[400px]",
          "opacity-0 transition-all duration-[250ms] ease-in-out",
          animationState === AnimationState.Hidden && "scale-50 opacity-0",
          animationState === AnimationState.Idle && "scale-1 opacity-100",
          animationState === AnimationState.Keep &&
            "translate-x-[20%] translate-y-[200px] rotate-[10deg] scale-[0.5] opacity-0",
          animationState === AnimationState.Unfollow &&
            "translate-x-[-20%] translate-y-[200px] rotate-[-10deg] scale-[0.5] opacity-0"
        )}
      >
        <FeedWidget accountId={currentAccount?.id}></FeedWidget>
      </Block>

      <Block className="mt-0 flex w-3/4 flex-shrink-0 flex-col items-start">
        {currentAccount && currentAccountRelationship ? (
          <>
            {isVisible && (
              <ReviewerFooter
                account={currentAccount}
                accountRelationship={currentAccountRelationship}
              />
            )}
            <ReviewerPrompt
              account={currentAccount}
              animationState={animationState}
            />
            <ReviewerButtons
              onUndoClick={onUndoClick}
              onUnfollowClick={onUnfollowClick}
              onKeepClick={onKeepClick}
              onNextClick={onNextClick}
              isVisible={isVisible}
              shouldSkipConfirmation={skipConfirmation}
            />
          </>
        ) : (
          <span className="prose p-3 dark:prose-invert">Loading...</span>
        )}
      </Block>
    </div>
  );
}
