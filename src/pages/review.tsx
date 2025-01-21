import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Block } from "../components/block";
import { Button } from "../components/button";
import { Finished } from "../components/finished";
import { LinkButton } from "../components/linkButton";
import { MastodonReviewer } from "../components/mastodonReviewer";
import { Options } from "../components/options";
import { MastodonProvider, useMastodon } from "../helpers/mastodonContext";
import { resetStates, useIsFinished } from "../store/mainStore";
import {
  fetchMastodonFollowings,
  fetchMastodonLists,
  markAsFinished,
  useMastodonAccountId,
  useMastodonAccountUsername,
  useMastodonFilteredFollowings,
  useMastodonKeptIds,
  useMastodonStartCount,
  useMastodonUnfollowedIds,
} from "../store/mastodonStore";

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

  const { client } = useMastodon();
  const accountId = useMastodonAccountId();
  const accountUsername = useMastodonAccountUsername();
  const keptIds = useMastodonKeptIds();
  const unfollowedIds = useMastodonUnfollowedIds();
  const startCount = useMastodonStartCount();

  const hasProgress = useMemo(
    () =>
      Boolean(
        (unfollowedIds && unfollowedIds.length) || (keptIds && keptIds.length),
      ),
    [keptIds, unfollowedIds],
  );
  const isFinished = useIsFinished();
  const filteredFollowings = useMastodonFilteredFollowings();

  useEffect(() => {
    if (!isReviewing || !client || !accountId) {
      return;
    }

    fetchMastodonFollowings(accountId, client);
    fetchMastodonLists(client);
  }, [accountId, client, isReviewing]);

  if (isFinished) {
    return <Finished />;
  }

  if (!accountUsername || !accountId) {
    return (
      <Block>
        <p className="custom-prose">Loading...</p>
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
          position="southeast"
        >
          Options
        </LinkButton>
        <MastodonReviewer
          onFinished={() => {
            markAsFinished();
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
          resetStates();
          router.push("/");
        }}
      >
        Log out
      </LinkButton>
      <Block className="inline-flex flex-col items-center justify-center gap-6">
        <h1 className="text-accentColor text-center">
          {hasProgress ? "Hello again," : "Hello"} @{accountUsername}!
          Let&apos;s go through those {startCount} accounts you are following 😤
          {hasProgress && (
            <>
              <br />
              {filteredFollowings.length} to go!
            </>
          )}
        </h1>
        <p className="custom-prose">
          You can&apos;t be expected to do this all at once, do not feel bad if
          you need to take a break. Progress will be saved as you go!
        </p>
        {hasProgress && (
          <p className="custom-prose">
            Keep at it! You started with {startCount} follows. We loaded your
            progress from last time when you kept {(keptIds || []).length}{" "}
            accounts that mattered to you.
            <br />
            <br />
            <strong>
              Let&apos;s get started on the {filteredFollowings.length} accounts
              you have left!
            </strong>
          </p>
        )}

        <Options />

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
        <div className="custom-prose opacity-60">
          <p className="!m-0">
            Based off{" "}
            <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
            by <a href="https://tarng.com/">Julius Tarng</a>.
            <br />
            Made by <a href="https://erambert.me">Damien Erambert</a>. Find me
            at{" "}
            <a href="https://social.erambert.me/@eramdam">
              eramdam@erambert.me
            </a>
            !
          </p>
        </div>
      </Block>
    </>
  );
};

export default Review;
