import localforage from "localforage";
import type { mastodon } from "masto";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Button } from "../components/button";
import { Block } from "../components/main";
import { Reviewer } from "../components/reviewer";

const Review: NextPage = () => {
  const [account, setAccount] = useState<mastodon.v1.AccountCredentials | null>(
    null
  );
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    localforage
      .getItem<mastodon.v1.AccountCredentials>("account")
      .then(setAccount);
  }, []);

  function renderContent() {
    if (!account) {
      return (
        <Block>
          <p>Loading...</p>
        </Block>
      );
    }

    if (isReviewing) {
      return <Reviewer />;
    }

    return (
      <Block>
        <h1 className="text-accentColor text-center">
          Hello @{account.username}! Let&apos;s go through those{" "}
          {account.followingCount} accounts you are following 😤
        </h1>
        <p className="prose">
          You can&apos;t be expected to do this all at once, do not feel bad if
          you need to take a break. Progress will be saved as you go!
        </p>
        <Button
          onPress={() => {
            setIsReviewing(true);
          }}
        >
          Start
        </Button>
      </Block>
    );
  }

  return (
    <>
      <Head>
        <title>Review</title>
      </Head>
      {renderContent()}
    </>
  );
};

export default Review;
