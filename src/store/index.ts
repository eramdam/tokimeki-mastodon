import { pick } from "lodash-es";
import type { mastodon } from "masto";

import { createCustomStore } from "./common";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}

export interface TokimekiAccount {
  id: string;
  acct: string;
  note: string;
  displayName: string;
  username: string;
  url: string;
  emojis: mastodon.v1.CustomEmoji[];
}

export function pickTokimekiAccount(
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

export interface TokimekiRelationship {
  followedBy: boolean;
  note?: string | null;
  showingReblogs: boolean;
}

export type MainState = {
  settings: {
    showBio: boolean;
    showNote: boolean;
    showFollowLabel: boolean;
    sortOrder: SortOrders;
    skipConfirmation: boolean;
  };
  isFetching: boolean;
  isFinished: boolean;
};

export const initialMainState: MainState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
    showNote: false,
    showFollowLabel: false,
    skipConfirmation: false,
  },
  isFetching: false,
  isFinished: false,
};

export const useMainStore = createCustomStore(initialMainState, "main-store");

type CommonServiceState = {
  /** The account currently being reviewed */
  currentAccount: TokimekiAccount | undefined;
  /** The lists that include the account being currently reviewed. */
  currentAccountListIds: string[] | undefined;
  /** The relationship the user has with the current account. */
  currentRelationship: TokimekiRelationship | undefined;
  /** The account that will be shown next. */
  nextAccount: TokimekiAccount | undefined;
  /** The lists that include the account that will be shown next. */
  nextAccountListIds: string[] | undefined;
  /** The relationship the user has with the next account. */
  nextRelationship: TokimekiRelationship | undefined;
  /** The IDs of accounts the user followed when they started the review process. */
  baseFollowingIds: string[];
  /** The IDs of accounts the user is currently following (might be redundant with `baseFollowingIds`) */
  followingIds: string[];
  /** The IDs of accounts the user decided to keep following. */
  keptIds: string[];
  /** The IDs of accoutns the user decided to unfollow. */
  unfollowedIds: string[];
  /** How many accounts the user started with. (might be redundant with `baseFollowingIds`) */
  startCount: number;
};

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
