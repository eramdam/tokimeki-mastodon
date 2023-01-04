import parse from "html-react-parser";
import type { mastodon } from "masto";
import { useMemo, useState } from "react";

import {
  useCurrentIndex,
  useFollowings,
  useSettings,
} from "../store/selectors";
import { SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import { getParserOptions } from "./htmlReactParserOptions";

interface ReviewerFooterProps {
  account: mastodon.v1.Account;
  accountRelationship: mastodon.v1.Relationship | undefined;
}
export function ReviewerFooter(props: ReviewerFooterProps) {
  const { account, accountRelationship } = props;
  const followingIndex = useCurrentIndex();
  const followings = useFollowings();

  const {
    showBio: initialShowBio,
    showFollowLabel,
    showNote: initialShowNote,
  } = useSettings();
  const [showBio, setShowBio] = useState(initialShowBio);
  const [showNote, setShowNote] = useState(initialShowNote);

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
          p: "inline-block first-of-type:mt-0 text-sm",
        },
      }),
    [account.emojis]
  );

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <p className="prose break-words text-left leading-normal dark:prose-invert">
          {renderTitle()}
          {account.displayName && (
            <strong className="inline-block">
              {renderWithEmoji(account.emojis, account.displayName.trim())}
            </strong>
          )}{" "}
          <a
            href={account.url}
            target="_blank"
            className="text-sm text-neutral-400 hover:underline"
            rel="noreferrer noopener"
          >
            @{account.acct}
          </a>
          !{" "}
          {showFollowLabel && accountRelationship?.followedBy && (
            <span className="rounded-md bg-violet-500 py-[4px] px-2 align-middle text-[10px] uppercase text-white dark:bg-violet-800">
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
      {showBio && account.note && (
        <div className="prose w-full rounded-md border-[1px] border-black/30 bg-black/10 p-2 leading-normal dark:bg-black/50 dark:prose-invert">
          <strong className="text-sm">Bio:</strong>{" "}
          {parse(account.note, parseOptions)}
        </div>
      )}
      {showNote && accountRelationship?.note && (
        <div className="prose w-full rounded-md border-[1px] border-black/30 bg-yellow-400/10 p-2 leading-normal dark:prose-invert">
          <strong className="text-sm">Note:</strong>{" "}
          <p className="mt-0 inline-block text-sm">
            {parse(accountRelationship.note, parseOptions)}
          </p>
        </div>
      )}
    </>
  );
}
