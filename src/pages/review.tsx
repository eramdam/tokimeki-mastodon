import { uniq } from "lodash-es";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { useButton } from "react-aria";
import { Button } from "../components/button";
import { Block } from "../components/main";
import { Reviewer } from "../components/reviewer";
import { MastodonProvider } from "../helpers/mastodonContext";
import {
    clearStorage,
    useItemFromLocalForage
} from "../helpers/storageHelpers";

const Review: NextPage = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const router = useRouter();
  const buttonRef = useRef(null);
  const { buttonProps } = useButton(
    {
      onPress: () => {
        clearStorage();
        router.push("/");
      },
    },
    buttonRef
  );
  const account = useItemFromLocalForage("account");
  const keptIds = useItemFromLocalForage("keptIds", { defaultValue: [] });
  const unfollowedIds = useItemFromLocalForage("unfollowedIds", {
    defaultValue: [],
  });
  const followingIds = useItemFromLocalForage("followingIds");
  const filteredIds = useMemo(() => {
    return uniq(followingIds || []).filter((i) => {
      return !unfollowedIds.includes(i) && !keptIds.includes(i);
    });
  }, [followingIds, keptIds, unfollowedIds]);
  const hasProgress = Boolean(unfollowedIds.length || keptIds.length);
  const [isFinished, setIsFinished] = useState(false);

  function renderContent() {
    if (!account) {
      return (
        <Block>
          <p className="prose dark:prose-invert">Loading...</p>
        </Block>
      );
    }

    if (isReviewing) {
      return (
        <Reviewer
          onFinished={() => {
            setIsFinished(true);
          }}
        />
      );
    }

    return (
      <>
        <button
          {...buttonProps}
          ref={buttonRef}
          className="absolute right-0 top-0 text-xs underline"
        >
          Log out
        </button>
        <Block className="inline-flex flex-col items-center justify-center gap-6">
          <h1 className="text-accentColor text-center">
            {hasProgress ? "Hello again," : "Hello"} @{account.username}!
            Let&apos;s go through those {account.followingCount} accounts you
            are following 😤
            {hasProgress && (
              <>
                <br />
                {filteredIds.length} to go!
              </>
            )}
          </h1>
          <p className="prose dark:prose-invert">
            You can&apos;t be expected to do this all at once, do not feel bad
            if you need to take a break. Progress will be saved as you go!
          </p>
          {hasProgress && (
            <p className="prose dark:prose-invert">
              Keep at it! You started with {account.followingCount} follows. We
              loaded your progress from last time when you kept {keptIds.length}{" "}
              accounts that mattered to you.
              <br />
              <br />
              <strong>
                Let&apos;s get started on the {filteredIds.length} accounts you
                have left!
              </strong>
            </p>
          )}
          <Button
            variant="primary"
            onPress={() => {
              setIsReviewing(true);
            }}
          >
            Start
          </Button>
        </Block>
      </>
    );
  }

  return <MastodonProvider>{renderContent()}</MastodonProvider>;
};

export default Review;
