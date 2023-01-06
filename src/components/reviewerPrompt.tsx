import type { PropsWithChildren, ReactNode } from "react";

import type { TokimekiAccount } from "../store";
import { renderWithEmoji } from "./emojify";
import { AnimationState } from "./reviewer";

export const ReviewerPrompt = (
  props: PropsWithChildren<{
    animationState: AnimationState;
    account: TokimekiAccount;
    loadingRender: ReactNode;
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
    }

    return <>Do their toots still spark joy or feel important to you?</>;
  }

  if (animationState === AnimationState.Hidden) {
    return <>{props.loadingRender}</>;
  }

  return <div className="custom-prose leading-normal ">{renderContent()}</div>;
};
