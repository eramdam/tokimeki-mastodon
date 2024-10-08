import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";

import { makeAccountName } from "../helpers/mastodonHelpers";
import type { TokimekiAccount, TokimekiRelationship } from "../store";
import {
  useCurrentIndex,
  useFollowingIds,
  useInstanceUrl,
  useListById,
  useSettings,
} from "../store/selectors";
import { SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import { HtmlRenderer } from "./htmlRendered";

interface ReviewerFooterProps {
  account: TokimekiAccount;
  accountRelationship: TokimekiRelationship | undefined;
  showBio: boolean;
  setShowBio: Dispatch<SetStateAction<boolean>>;
  showNote: boolean;
  setShowNote: Dispatch<SetStateAction<boolean>>;
  addedToListId: string | undefined;
}
export function ReviewerFooter(props: ReviewerFooterProps) {
  const {
    account,
    accountRelationship,
    showBio,
    setShowBio,
    showNote,
    setShowNote,
  } = props;
  const followingIndex = useCurrentIndex();
  const followings = useFollowingIds();
  const { showFollowLabel } = useSettings();
  const instanceUrl = useInstanceUrl();
  const list = useListById(props.addedToListId);

  const renderTitle = () => {
    if (followingIndex === followings.length - 1) {
      return "Last but not least, ";
    }

    return followingIndex === 0 ? "Starting with " : `#${followingIndex + 1}: `;
  };

  const baseBlockClassname =
    "custom-prose w-full rounded-md border-[1px] border-black/30 p-2 leading-normal";

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <p className="custom-prose break-words text-left leading-normal">
          {list && (
            <>
              Added to <strong>{list.title}</strong>!
              <br />
            </>
          )}
          {renderTitle()}
          {makeAccountName(account) && (
            <strong className="inline-block">
              {renderWithEmoji(account.emojis, makeAccountName(account).trim())}
            </strong>
          )}{" "}
          <a
            href={`${instanceUrl}/@${account.acct}`}
            target="_blank"
            className="text-sm text-neutral-400 hover:underline"
            rel="noreferrer noopener"
          >
            @{account.acct}
          </a>
          !{" "}
          {showFollowLabel && accountRelationship?.followedBy && (
            <span className="inline-block rounded-md bg-violet-500 py-[2px] px-2 align-middle text-[10px] uppercase text-white dark:bg-violet-800">
              Follows you
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        {account.note && (
          <SmallButton
            variant="secondary"
            onPress={() => {
              setShowBio((p) => !p);
            }}
          >
            {showBio ? "Hide bio" : "Show bio"}
          </SmallButton>
        )}
        {accountRelationship?.note && (
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
      {((showBio && account.note) ||
        (showNote && accountRelationship?.note)) && (
        <div className="flex w-full flex-shrink flex-grow flex-col gap-3 overflow-scroll">
          {showBio && account.note && (
            <div
              className={clsx(
                baseBlockClassname,
                "border-black/30 bg-black/10 dark:bg-black/50",
              )}
            >
              <strong className="text-sm">Bio:</strong>{" "}
              <HtmlRenderer
                content={account.note}
                emojiArray={account.emojis}
                classNames={{
                  p: "first-of-type:mt-0 text-sm !mt-1 lg:!mt-2",
                }}
              />
            </div>
          )}
          {showNote && accountRelationship?.note && (
            <div className={clsx(baseBlockClassname, "bg-yellow-400/10")}>
              <strong className="text-sm">Note:</strong>{" "}
              <HtmlRenderer
                content={accountRelationship.note}
                emojiArray={account.emojis}
                classNames={{
                  p: "first-of-type:mt-0 text-sm !mt-1 lg:!mt-2",
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
