import type { PropsWithChildren, ReactNode } from "react";

import { makeAccountName } from "../helpers/mastodonHelpers";
import type { TokimekiAccount } from "../store";
import { ReviewTypes } from "../store";
import { renderWithEmoji } from "./emojify";
import { AnimationState } from "./reviewer";

export const ReviewerPrompt = (
  props: PropsWithChildren<{
    animationState: AnimationState;
    account: TokimekiAccount;
    loadingRender: ReactNode;
    reviewType: ReviewTypes;
  }>,
) => {
  const { animationState, account, reviewType } = props;
  const accountName = makeAccountName(account);

  function renderContent() {
    if (reviewType === ReviewTypes.FOLLOW_REQUESTS) {
      if (animationState === AnimationState.Keep) {
        return (
          <>
            <strong>{renderWithEmoji(account.emojis, accountName)}</strong> is
            now following you!
          </>
        );
      } else if (animationState === AnimationState.Remove) {
        return (
          <>
            You rejected{" "}
            <strong>{renderWithEmoji(account.emojis, accountName)}</strong>'s
            follow request!
          </>
        );
      }

      return (
        <>
          Do you want{" "}
          <strong>{renderWithEmoji(account.emojis, accountName)}</strong> to
          follow you?
        </>
      );
    }

    if (reviewType === ReviewTypes.FOLLOWERS) {
      if (animationState === AnimationState.Keep) {
        return (
          <>
            <strong>{renderWithEmoji(account.emojis, accountName)}</strong>{" "}
            still follows you!
          </>
        );
      } else if (animationState === AnimationState.Remove) {
        return (
          <>
            You removed{" "}
            <strong>{renderWithEmoji(account.emojis, accountName)}</strong> from
            your followers!
          </>
        );
      }

      return (
        <>
          Do you want to keep{" "}
          <strong>{renderWithEmoji(account.emojis, accountName)}</strong> as a
          follower?
        </>
      );
    }

    if (animationState === AnimationState.Keep) {
      return (
        <>
          Glad to hear{" "}
          <strong>{renderWithEmoji(account.emojis, accountName)}</strong>
          &apos;s toots are still important to you.
        </>
      );
    } else if (animationState === AnimationState.Remove) {
      return (
        <>
          Great, unfollowed! Let&apos;s thank{" "}
          <strong>{renderWithEmoji(account.emojis, accountName)}</strong> for
          all the toots you&apos;ve enjoyed before.{" "}
        </>
      );
    }

    return <>Do their toots still spark joy or feel important to you?</>;
  }

  if (animationState === AnimationState.Hidden) {
    return <>{props.loadingRender}</>;
  }

  return <div className="custom-prose leading-normal">{renderContent()}</div>;
};
