import type { mastodon } from "masto";
import { type CommonServiceState, createCustomStore } from "./common";

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
