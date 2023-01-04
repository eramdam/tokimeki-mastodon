import type { mastodon } from "masto";
import type { PropsWithChildren } from "react";

import { renderWithEmoji } from "./emojify";
import { AnimationState } from "./reviewer";

export const ReviewerPrompt = (
  props: PropsWithChildren<{
    animationState?: AnimationState;
    account: mastodon.v1.Account;
  }>
) => {
  const { animationState, account } = props;

  function renderContent() {
    if (animationState === AnimationState.Keep) {
      return (
        <>
          Glad to hear{" "}
          <strong>
            {renderWithEmoji(
              account.emojis,
              account.displayName.trim() || account.acct
            )}
          </strong>
          &apos;s toots are still important to you.
        </>
      );
    } else if (animationState === AnimationState.Unfollow) {
      return (
        <>
          Great, unfollowed! Let&apos;s thank{" "}
          <strong>
            {renderWithEmoji(
              account.emojis,
              account.displayName.trim() || account.acct
            )}
          </strong>{" "}
          for all the toots you&apos;ve enjoyed before.{" "}
        </>
      );
    } else if (animationState === AnimationState.Hidden) {
      return <>Loading...</>;
    }

    return <>Do their toots still spark joy or feel important to you?</>;
  }

  return (
    <div className="prose leading-normal dark:prose-invert">
      {renderContent()}
    </div>
  );
};
