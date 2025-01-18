import type { mastodon } from "masto";
import { type CommonServiceState, createCustomStore } from "./common";
import { useMemo } from "react";
import { filterFollowingIds } from "./helpers";
import { pick } from "lodash-es";
import type { TokimekiAccount } from "./common";

type MastodonState = CommonServiceState & {
  /** Mastodon app client id */
  clientId: string | undefined;
  /** Mastodon app client secret */
  clientSecret: string | undefined;
  /** Mastodon instance URL */
  instanceUrl: string | undefined;
  /** Access token for the current app */
  accessToken: string | undefined;
  /** ID of the current account */
  accountId: string | undefined;
  /** Username of the current account (before the @domain.com part) */
  accountUsername: string | undefined;
  /** Lists belonging to the logged-in user. */
  lists: mastodon.v1.List[];
};

export const initialMastodonState: MastodonState = {
  clientId: undefined,
  clientSecret: undefined,
  instanceUrl: undefined,
  accessToken: undefined,
  accountId: undefined,
  accountUsername: undefined,
  lists: [],
  currentAccount: undefined,
  currentAccountListIds: undefined,
  currentRelationship: undefined,
  nextAccount: undefined,
  nextAccountListIds: undefined,
  nextRelationship: undefined,
  baseFollowingIds: [],
  followingIds: [],
  keptIds: [],
  unfollowedIds: [],
  startCount: 0,
};

export const useMastodonStore = createCustomStore(
  initialMastodonState,
  "mastodon",
);

export const useMastodonCurrentAccountListIds = () =>
  useMastodonStore((state) => state.currentAccountListIds);
export const useMastodonCurrentAccountRelationship = () =>
  useMastodonStore((state) => state.currentRelationship);
export const useMastodonCurrentAccount = () =>
  useMastodonStore((state) => state.currentAccount);

export const useMastodonLists = () => useMastodonStore((state) => state.lists);
export const useMastodonListById = (id: string | undefined) => {
  return useMastodonStore((state) => state.lists.find((l) => l.id === id));
};
export const useMastodonAccountId = () =>
  useMastodonStore((state) => state.accountId);
export const useMastodonAccountUsername = () =>
  useMastodonStore((state) => state.accountUsername);
export const useMastodonKeptIds = () =>
  useMastodonStore((state) => state.keptIds);
export const useMastodonUnfollowedIds = () =>
  useMastodonStore((state) => state.unfollowedIds);
export const useMastodonStartCount = () =>
  useMastodonStore((state) => state.startCount || 0);
export const useMastodonInstanceUrl = () =>
  useMastodonStore((state) => state.instanceUrl?.replace(/\/$/, ""));
export const useMastodonAccessToken = () =>
  useMastodonStore((state) => state.accessToken);
export const useMastodonOAuthCodeDependencies = () =>
  useMastodonStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  });

export const useMastodonFollowingIds = () =>
  useMastodonStore((state) => state.followingIds);
export const useMastodonBaseFollowings = () =>
  useMastodonStore((state) => state.baseFollowingIds);
export const useMastodonFilteredFollowings = () => {
  const baseFollowings = useMastodonFollowingIds();
  const keptIds = useMastodonKeptIds();
  const unfollowedIds = useMastodonUnfollowedIds();

  return useMemo(
    () => filterFollowingIds(baseFollowings, keptIds, unfollowedIds),
    [baseFollowings, keptIds, unfollowedIds],
  );
};

export const useMastodonCurrentIndex = () => {
  const currentAccount = useMastodonCurrentAccount();
  const followings = useMastodonFollowingIds();

  if (!currentAccount) {
    return 0;
  }

  return followings.indexOf(currentAccount.id);
};

export const useMastodonKeptAccounts = () => {
  const baseFollowings = useMastodonFollowingIds();
  const keptIds = useMastodonKeptIds();

  return useMemo(
    () => baseFollowings.filter((a) => keptIds?.includes(a)),
    [baseFollowings, keptIds],
  );
};

export function makeTokimekiAccountFromMastodonAccount(
  account: mastodon.v1.Account | TokimekiAccount,
): TokimekiAccount {
  return pick(account, [
    "id",
    "acct",
    "note",
    "displayName",
    "username",
    "url",
    "emojis",
  ]);
}
