import { uniq } from "lodash-es";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useRadioGroup } from "react-aria";

import { Button } from "../components/button";
import { Finished } from "../components/finished";
import { LinkButton } from "../components/linkButton";
import { Block } from "../components/main";
import { Radio, RadioGroup } from "../components/radioGroup";
import { Reviewer } from "../components/reviewer";
import { MastodonProvider } from "../helpers/mastodonContext";
import { useMastoFollowingsList } from "../helpers/mastodonHelpers";
import {
  clearStorage,
  setStoredItem,
  SortOrders,
  useItemFromLocalForage,
} from "../helpers/storageHelpers";

const Review: NextPage = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <MastodonProvider>
      <ReviewContent />
    </MastodonProvider>
  );
};

const ReviewContent = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const router = useRouter();

  const account = useItemFromLocalForage("account");
  const keptIdsFromStorage = useItemFromLocalForage("keptIds");
  const keptIds = useMemo(() => keptIdsFromStorage || [], [keptIdsFromStorage]);
  const unfollowedIds = useItemFromLocalForage("unfollowedIds");
  const showBio = useItemFromLocalForage("showBio");
  const sortOrder = useItemFromLocalForage("sortOrder");
  const hasProgress = useMemo(
    () =>
      Boolean(
        (unfollowedIds && unfollowedIds.length) ||
          (keptIdsFromStorage && keptIdsFromStorage.length)
      ),
    [keptIdsFromStorage, unfollowedIds]
  );
  const [isFinished, setIsFinished] = useState(false);
  const followingsListProps = useMastoFollowingsList();
  console.log(followingsListProps);

  useEffect(() => {
    if (hasProgress && !followingsListProps.filteredAccounts.length) {
      setIsFinished(true);
    }
  }, [followingsListProps.filteredAccounts.length, hasProgress]);

  if (isFinished) {
    return <Finished {...followingsListProps} />;
  }

  if (!account) {
    return (
      <Block>
        <p className="prose dark:prose-invert">Loading...</p>
      </Block>
    );
  }

  if (isReviewing) {
    return (
      <>
        <LinkButton
          onPress={() => {
            setIsReviewing(false);
          }}
          position="northeast"
        >
          Options
        </LinkButton>
        <Reviewer
          {...followingsListProps}
          onFinished={() => {
            setIsFinished(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      <LinkButton
        position="southeast"
        onPress={() => {
          clearStorage();
          router.push("/");
        }}
      >
        Log out
      </LinkButton>
      <Block className="inline-flex flex-col items-center justify-center gap-6">
        <h1 className="text-accentColor text-center">
          {hasProgress ? "Hello again," : "Hello"} @{account.username}!
          Let&apos;s go through those {account.followingCount} accounts you are
          following 😤
          {hasProgress && (
            <>
              <br />
              {followingsListProps.filteredAccounts.length} to go!
            </>
          )}
        </h1>
        <p className="prose dark:prose-invert">
          You can&apos;t be expected to do this all at once, do not feel bad if
          you need to take a break. Progress will be saved as you go!
        </p>
        {hasProgress && (
          <p className="prose dark:prose-invert">
            Keep at it! You started with {account.followingCount} follows. We
            loaded your progress from last time when you kept {keptIds.length}{" "}
            accounts that mattered to you.
            <br />
            <br />
            <strong>
              Let&apos;s get started on the{" "}
              {followingsListProps.filteredAccounts.length} accounts you have
              left!
            </strong>
          </p>
        )}

        <div className="prose w-full dark:prose-invert">
          <h3>Options</h3>
          <div>
            <label>
              <input
                type="checkbox"
                checked={Boolean(showBio)}
                onChange={() => {
                  setStoredItem("showBio", !showBio);
                }}
              />{" "}
              <strong>Show account bio&apos;s</strong> (Recommended: off)
            </label>
            <p className="mt-0 leading-tight">
              I&apos;ve followed a lot of accounts based on their profile or who
              they are, but not their actual tweets. Hide their bio&apos;s so
              you can evaluate based on content only.
            </p>
          </div>
          <RadioGroup
            label={
              <>
                <strong>Select an order to use</strong> (Recommended: Oldest
                first)
              </>
            }
            value={sortOrder || SortOrders.OLDEST}
            onChange={(value) => {
              followingsListProps.updateSortOrder(value as SortOrders);
            }}
          >
            <Radio value={SortOrders.OLDEST}>
              Oldest first, chronological order
            </Radio>
            <Radio value={SortOrders.RANDOM}>Random order</Radio>
            <Radio value={SortOrders.NEWEST}>
              Newest first, reverse chronological order
            </Radio>
          </RadioGroup>
        </div>

        <Button
          variant="primary"
          onPress={() => {
            setIsReviewing(true);
          }}
        >
          Start
        </Button>
      </Block>
      <Block className="w-full">
        <div className="prose opacity-60 dark:prose-invert">
          <p>
            Based off{" "}
            <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
            by <a href="https://tarng.com/">Julius Tarng</a>.
            <br />
            <br />
            Made by <a href="https://erambert.me">Damien Erambert</a>. Find me
            at{" "}
            <a href="https://octodon.social/@eramdam">eramdam@octodon.social</a>
            !
          </p>
        </div>
      </Block>
    </>
  );
};

export default Review;
