import localforage from "localforage";
import type { mastodon } from "masto";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useButton } from "react-aria";
import { Button } from "../components/button";
import { Block } from "../components/main";
import { Reviewer } from "../components/reviewer";
import { clearStorage } from "../helpers/storageHelpers";

const Review: NextPage = () => {
  const [account, setAccount] = useState<mastodon.v1.AccountCredentials | null>(
    null
  );
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

  useEffect(() => {
    localforage
      .getItem<mastodon.v1.AccountCredentials>("account")
      .then(setAccount);
  }, []);

  function renderContent() {
    if (!account) {
      return (
        <Block>
          <p className="prose dark:prose-invert">Loading...</p>
        </Block>
      );
    }

    if (isReviewing) {
      return <Reviewer />;
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
            Hello @{account.username}! Let&apos;s go through those{" "}
            {account.followingCount} accounts you are following 😤
          </h1>
          <p className="prose dark:prose-invert">
            You can&apos;t be expected to do this all at once, do not feel bad
            if you need to take a break. Progress will be saved as you go!
          </p>
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

  return <>{renderContent()}</>;
};

export default Review;
