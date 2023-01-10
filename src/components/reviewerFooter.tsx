import clsx from "clsx";
import parse from "html-react-parser";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";

import type { TokimekiAccount, TokimekiRelationship } from "../store";
import {
  useCurrentIndex,
  useFollowingIds,
  useInstanceUrl,
  useSettings,
} from "../store/selectors";
import { SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import { getParserOptions } from "./htmlReactParserOptions";

interface ReviewerFooterProps {
  account: TokimekiAccount;
  accountRelationship: TokimekiRelationship | undefined;
  showBio: boolean;
  setShowBio: Dispatch<SetStateAction<boolean>>;
  showNote: boolean;
  setShowNote: Dispatch<SetStateAction<boolean>>;
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

  const renderTitle = () => {
    if (followingIndex === followings.length - 1) {
      return "Last but not least, ";
    }

    return followingIndex === 0 ? "Starting with " : `#${followingIndex + 1}: `;
  };

  const parseOptions = useMemo(
    () =>
      getParserOptions({
        emojiArray: account.emojis || [],
        classNames: {
          p: "inline-block first-of-type:mt-0 text-sm !mt-1 lg:!mt-2",
        },
      }),
    [account.emojis]
  );

  const baseBlockClassname =
    "custom-prose w-full rounded-md border-[1px] border-black/30 p-2 leading-normal";

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <p className="custom-prose break-words text-left leading-normal ">
          {renderTitle()}
          {account.displayName && (
            <strong className="inline-block">
              {renderWithEmoji(account.emojis, account.displayName.trim())}
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
                "border-black/30 bg-black/10 dark:bg-black/50"
              )}
            >
              <strong className="text-sm">Bio:</strong>{" "}
              {parse(account.note, parseOptions)}
            </div>
          )}
          {showNote && accountRelationship?.note && (
            <div className={clsx(baseBlockClassname, "bg-yellow-400/10")}>
              <strong className="text-sm">Note:</strong>{" "}
              {parse(accountRelationship.note, parseOptions)}
            </div>
          )}
        </div>
      )}
    </>
  );
}
