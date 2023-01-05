/* eslint-disable @next/next/no-img-element */
import { pick } from "lodash-es";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { useMastodon } from "../helpers/mastodonContext";
import { resetState } from "../store/actions";
import {
  useAccountId,
  useInstanceUrl,
  useKeptIds,
  useStartCount,
} from "../store/selectors";
import { Block } from "./block";
import { Button } from "./button";

export function Finished() {
  const [maybeReset, setMaybeReset] = useState(false);
  const router = useRouter();
  const keptIdsFromStorage = useKeptIds();
  const keptIds = useMemo(() => keptIdsFromStorage || [], [keptIdsFromStorage]);
  const startCount = useStartCount();
  const instanceUrl = useInstanceUrl();
  const accountId = useAccountId();

  const { client } = useMastodon();
  const { data: avatarsData } = useSWR("pics", async () => {
    if (!client || !accountId) {
      return [];
    }

    const accounts = await client.v1.accounts.listFollowing(accountId, {
      limit: 80,
    });
    return accounts.map((a) => pick(a, ["id", "avatar", "displayName"]));
  });

  const keptPicsRenders = useMemo(() => {
    if (!avatarsData) {
      return null;
    }
    return avatarsData.map((pic) => {
      const delay = Math.random() * 10;
      return (
        <div
          className="snowflake overflow-hidden rounded-full bg-white shadow-lg"
          key={pic.id}
          style={{
            left: `${Math.random() * 110 - 10}%`,
            animationDelay: `${delay}s, ${delay - Math.random() * 3}s`,
            zIndex: `${Math.random() > 0.5 ? 1 : -1}`,
          }}
        >
          <img src={pic.avatar} alt={pic.displayName} />
        </div>
      );
    });
  }, [avatarsData]);

  const renderFinishedFooter = () => {
    if (maybeReset) {
      return (
        <Block className="mt-0 flex w-3/4 flex-shrink-0 flex-col items-start">
          <p className="custom-prose leading-normal ">
            Wanna do it again with your current follows? <br />
            <br />
            This will reset your progress data and start over. Then, it will log
            you out so you can log in again and start over fresh!
          </p>
          <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
            <Button
              variant="secondary"
              onPress={async () => {
                setMaybeReset(false);
              }}
            >
              Nevermind
            </Button>
            <Button
              onPress={() => {
                resetState();
                router.push("/");
              }}
              variant="secondary"
            >
              Reset & Log out
            </Button>
          </div>
        </Block>
      );
    }

    return (
      <Block className="mt-0 flex w-3/4 flex-shrink-0 flex-col items-start">
        <p className="custom-prose leading-normal ">
          Wow, you&apos;ve done it — amazing! Hope you enjoy your new feed. Come
          back if you ever feel like it&apos;s getting out of control again.{" "}
          <br />
          <br />— <a href="https://octodon.social/@eramdam">@Eramdam</a>
        </p>
        <div className="mt-2 -mb-8 inline-flex w-full justify-center gap-4">
          <Button
            variant="secondary"
            onPress={async () => {
              const text =
                "✨I just konmari'd my Mastodon feed!✨\n\n" +
                `Started with ${startCount} follows and unfollowed ${
                  startCount - keptIds.length
                }` +
                ` using Tokimeki Unfollow\n${window.origin}`;

              window.open(
                `${instanceUrl}/share?text=${encodeURIComponent(text)}`
              );
            }}
          >
            Post
          </Button>
          <Button
            onPress={() => {
              setMaybeReset(true);
            }}
            variant="secondary"
          >
            Do it again?
          </Button>
        </div>
      </Block>
    );
  };

  return (
    <div className="flex max-h-full flex-1 flex-shrink flex-col items-center">
      {keptPicsRenders}
      <div className="flex-1">
        <Block className="custom-prose">
          <h1 className="text-accentColor text-center">Tokimeki Complete!</h1>

          <div className="flex flex-col gap-2">
            <div className="opacity-60">Results</div>
            <div className="flex">
              <span className="flex-1">Starting follows</span>
              <span>{startCount}</span>
            </div>
            <div className="flex">
              <span className="flex-1">Unfollowed</span>
              <span className="text-red-500">
                {keptIds.length - startCount}
              </span>
            </div>
            <hr className="my-4" />
            <div className="flex">
              <span className="flex-1">Now following</span>
              <span className="text-accentColor">{keptIds.length}</span>
            </div>
          </div>
        </Block>
      </div>
      {renderFinishedFooter()}
    </div>
  );
}
