import clsx from "clsx";
import { useState } from "react";

import { useMastodon } from "../helpers/mastodonContext";
import {
  goToNextAccount,
  keepAccount,
  unfollowAccount,
} from "../store/actions";
import {
  useCurrentAccount,
  useCurrentAccountRelationship,
  useFilteredFollowings,
  useFollowings,
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
  const followings = useFollowings();
  const { client } = useMastodon();

  const [animationState, setAnimated] = useState(AnimationState.Idle);
  const isVisible = animationState === AnimationState.Idle;

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

  if (followings?.length === 0) {
    return <FollowingsLoadingIndicator />;
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
        {isVisible && (
          <ReviewerFooter
            account={currentAccount}
            accountRelationship={currentAccountRelationship}
          />
        )}
        <ReviewerPrompt account={currentAccount} />
        <ReviewerButtons
          onUndoClick={() => setAnimated(AnimationState.Idle)}
          onUnfollowClick={() => setAnimated(AnimationState.Unfollow)}
          onKeepClick={() => setAnimated(AnimationState.Keep)}
          onNextClick={onNextClick}
          isVisible={isVisible}
        />
      </Block>
    </div>
  );
}
