import clsx from "clsx";
import { compact } from "lodash-es";
import { useState } from "react";

import { delayAsync } from "../helpers/asyncHelpers";
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
  const [isFetching, setIsFetching] = useState(false);
  const [addedToListId, setAddedToListId] = useState<string | undefined>(
    undefined,
  );

  const onNextClick = async ({
    forceUnfollow,
    dontHide,
  }: {
    forceUnfollow?: boolean;
    dontHide?: boolean;
  }) => {
    if (!client || !currentAccount || isFetching) {
      return;
    }

    setIsFetching(true);

    const shouldUnfollow =
      forceUnfollow ?? animationState === AnimationState.Unfollow;
    if (currentAccount) {
      if (shouldUnfollow) {
        console.log("Will unfollow", currentAccount.acct);
        if (process.env.NODE_ENV !== "development") {
          await client.v1.accounts.$select(currentAccount.id).unfollow();
        }
        unfollowAccount(currentAccount.id);
      } else {
        keepAccount(currentAccount.id);
      }
    }

    if (!dontHide) {
      setAnimated(AnimationState.Hidden);
    }

    if (
      filteredFollowings.length < 1 ||
      (currentAccount &&
        currentAccount.id === followings[followings.length - 1])
    ) {
      setIsFetching(false);
      props.onFinished();
      return;
    }

    setAddedToListId(undefined);
    setAnimated(AnimationState.Idle);
    await goToNextAccount(client, currentAccount);
    setIsFetching(false);
  };

  const onUndoClick = () => setAnimated(AnimationState.Idle);
  const onUnfollowClick = async () => {
    if (skipConfirmation) {
      setAnimated(AnimationState.Hidden);
      await delayAsync(100);
      onNextClick({ forceUnfollow: true, dontHide: true });
    } else {
      setAnimated(AnimationState.Unfollow);
    }
  };
  const onKeepClick = async () => {
    if (skipConfirmation) {
      setAnimated(AnimationState.Hidden);
      await delayAsync(100);
      onNextClick({ forceUnfollow: false, dontHide: true });
    } else {
      setAnimated(AnimationState.Keep);
    }
  };
  const onAddToList = async (listId: string) => {
    if (!client) {
      return;
    }
    await client.v1.lists.$select(listId).accounts.create({
      accountIds: compact([currentAccount?.id ?? ""]),
    });
    setAddedToListId(listId);
  };

  const { showBio: initialShowBio, showNote: initialShowNote } = useSettings();
  const [showBio, setShowBio] = useState(initialShowBio);
  const [showNote, setShowNote] = useState(initialShowNote);

  if (followings?.length === 0) {
    return <FollowingsLoadingIndicator />;
  }

  const loadingRender = (
    <span className="custom-prose min-h-[100px]">Loading...</span>
  );

  return (
    <div className="flex max-h-full flex-1 flex-shrink flex-col items-center">
      <Block
        className={clsx(
          "relative m-auto inline-flex flex-1 flex-shrink overflow-hidden !p-0",
          "w-full lg:w-[400px]",
          "transition-all duration-[250ms] ease-in-out",
          animationState !== AnimationState.Idle && "opacity-0",
          animationState === AnimationState.Hidden && "scale-0 opacity-0",
          animationState === AnimationState.Idle && "scale-1 opacity-100",
          animationState === AnimationState.Keep &&
            "translate-x-[20%] translate-y-[200px] rotate-[10deg] scale-0 opacity-0",
          animationState === AnimationState.Unfollow &&
            "translate-x-[-20%] translate-y-[200px] rotate-[-10deg] scale-0 opacity-0",
        )}
      >
        <FeedWidget
          key={currentAccount?.id}
          account={currentAccount}
        ></FeedWidget>
      </Block>

      <Block
        className={clsx(
          "mt-0 flex max-h-[75vh] flex-shrink-0 flex-col items-start border-t-2 lg:max-h-[50vh] lg:w-3/4 dark:border-t-neutral-600",
        )}
      >
        {currentAccount && currentAccountRelationship ? (
          <>
            {isVisible && (
              <ReviewerFooter
                showBio={showBio}
                setShowBio={setShowBio}
                showNote={showNote}
                setShowNote={setShowNote}
                account={currentAccount}
                accountRelationship={currentAccountRelationship}
                addedToListId={addedToListId}
              />
            )}
            <ReviewerPrompt
              account={currentAccount}
              animationState={animationState}
              loadingRender={loadingRender}
            />
            <ReviewerButtons
              onUndoClick={onUndoClick}
              onUnfollowClick={onUnfollowClick}
              onKeepClick={onKeepClick}
              onAddToList={onAddToList}
              onNextClick={() => onNextClick({})}
              isVisible={isVisible}
              shouldSkipConfirmation={skipConfirmation}
              isFetching={isFetching}
            />
          </>
        ) : (
          loadingRender
        )}
      </Block>
    </div>
  );
}
