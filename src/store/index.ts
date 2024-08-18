import { omit, pick } from "lodash-es";
import type { mastodon } from "masto";
import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist } from "zustand/middleware";

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

export interface TokimekiState {
  clientId?: string;
  clientSecret?: string;
  instanceUrl?: string;
  accessToken?: string;
  accountId?: string;
  accountUsername?: string;
  startCount?: number;
  unfollowedIds: string[];
  keptIds: string[];
  settings: {
    showBio: boolean;
    showNote: boolean;
    showFollowLabel: boolean;
    sortOrder: SortOrders;
    skipConfirmation: boolean;
  };
  isFetching: boolean;
  currentAccount?: TokimekiAccount;
  currentAccountListIds?: string[];
  currentRelationship?: TokimekiRelationship;
  nextAccount?: TokimekiAccount;
  nextAccountListIds?: string[];
  nextRelationship?: TokimekiRelationship;
  baseFollowingIds: string[];
  followingIds: string[];
  isFinished: boolean;
  lists: mastodon.v1.List[];
}

export const initialPersistedState: TokimekiState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
    showNote: false,
    showFollowLabel: false,
    skipConfirmation: false,
  },
  keptIds: [],
  unfollowedIds: [],
  isFinished: false,
  isFetching: false,
  baseFollowingIds: [],
  followingIds: [],
  lists: [],
};

export const usePersistedStore = createWithEqualityFn<TokimekiState>()(
  devtools(
    persist(() => initialPersistedState, {
      name: "tokimeki-mastodon", // name of the item in the storage (must be unique)
      partialize(state) {
        return omit(state, ["actions", "nextAccount", "nextRelationship"]);
      },
      version: 3,
    }),
    { name: "main-store" },
  ),
);
