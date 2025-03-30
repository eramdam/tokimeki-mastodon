import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Block } from "../components/block";
import { Button } from "../components/button";
import { Finished } from "../components/finished";
import { LinkButton } from "../components/linkButton";
import { ReviewOptions } from "../components/options";
import { Reviewer } from "../components/reviewer";
import { MastodonProvider, useMastodon } from "../helpers/mastodonContext";
import {
  fetchFollowings,
  fetchFollowRequesters,
  fetchLists,
  markAsFinished,
  resetState,
  setReviewType,
} from "../store/actions";
import {
  useUserAccountId,
  useUserAccountUsername,
  useFilteredFollowings,
  useIsFinished,
  useKeptIds,
  useStartCount,
  useRemoveAccountIds,
  useReviewType,
} from "../store/selectors";
import { Footer } from "../components/footer";
import { Radio, RadioGroup } from "../components/radioGroup";
import { ReviewTypes } from "../store";

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
  const userAccountId = useUserAccountId();
  const userAccountUsername = useUserAccountUsername();
  const keptIds = useKeptIds();
  const unfollowedIds = useRemoveAccountIds();
  const startCount = useStartCount();

  const hasProgress = useMemo(
    () =>
      Boolean(
        (unfollowedIds && unfollowedIds.length) || (keptIds && keptIds.length),
      ),
    [keptIds, unfollowedIds],
  );
  const isFinished = useIsFinished();
  const filteredFollowings = useFilteredFollowings();
  const reviewType = useReviewType();

  useEffect(() => {
    if (!isReviewing || !client || !userAccountId) {
      return;
    }

    switch (reviewType) {
      case ReviewTypes.FOLLOWINGS: {
        fetchFollowings(userAccountId, client);
        fetchLists(client);
        break;
      }
      case ReviewTypes.FOLLOW_REQUESTS: {
        fetchFollowRequesters(userAccountId, client);
        break;
      }
    }
  }, [userAccountId, client, isReviewing]);

  if (isFinished) {
    return <Finished />;
  }

  if (!userAccountUsername || !userAccountId) {
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
        <Reviewer
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
          resetState();
          router.push("/");
        }}
      >
        Log out
      </LinkButton>
      <Block className="inline-flex flex-col items-center justify-center gap-6">
        <h1 className="text-accentColor text-center">
          Hello @{userAccountUsername}!
          {/* {hasProgress ? "Hello again," : "Hello"} @{userAccountUsername}!
          Let&apos;s go through those {startCount} accounts you are following 😤
          {hasProgress && (
            <>
              <br />
              {filteredFollowings.length} to go!
            </>
          )} */}
        </h1>
        <p className="custom-prose">
          You can&apos;t be expected to do this all at once, do not feel bad if
          you need to take a break. Progress will be saved as you go!
        </p>
        <div className="custom-prose w-full">
          <RadioGroup
            className="mb-5 mt-5"
            label={<strong>What would you like to review today?</strong>}
            value={reviewType || ReviewTypes.FOLLOWINGS}
            onChange={(value) => {
              setReviewType(value as ReviewTypes);
            }}
          >
            <Radio value={ReviewTypes.FOLLOWINGS}>
              Followings{" "}
              {hasProgress &&
                reviewType === ReviewTypes.FOLLOWINGS &&
                "(current)"}
            </Radio>
            <Radio value={ReviewTypes.FOLLOW_REQUESTS}>
              Follow requests{" "}
              {hasProgress &&
                reviewType === ReviewTypes.FOLLOW_REQUESTS &&
                "(current)"}
            </Radio>
          </RadioGroup>
        </div>

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

        <ReviewOptions />

        <Button
          variant="primary"
          onPress={() => {
            setIsReviewing(true);
          }}
        >
          Start
        </Button>
      </Block>
      <Footer />
    </>
  );
};

export default Review;
