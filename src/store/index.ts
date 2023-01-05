import { omit } from "lodash-es";
import type { mastodon } from "masto";
import create from "zustand";
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
  url: string;
  emojis: mastodon.v1.CustomEmoji[];
}

export interface TokimekiRelationship {
  followedBy: boolean;
  note?: string | null;
}

export interface TokimekiState {
  clientId?: string;
  clientSecret?: string;
  instanceUrl?: string;
  accessToken?: string;
  accountId?: string;
  accountUsername?: string;
  startCount?: number;
  unfollowedIds?: string[];
  keptIds?: string[];
  settings: {
    showBio: boolean;
    showNote: boolean;
    showFollowLabel: boolean;
    sortOrder: SortOrders;
  };
  isFetching: boolean;
  currentAccount?: TokimekiAccount;
  baseFollowingIds: string[];
  followingIds: string[];
  isFinished: boolean;
  currentRelationship?: TokimekiRelationship;
}

export const initialPersistedState: TokimekiState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
    showNote: false,
    showFollowLabel: false,
  },
  isFinished: false,
  isFetching: false,
  baseFollowingIds: [],
  followingIds: [],
};

export const usePersistedStore = create<TokimekiState>()(
  devtools(
    persist(() => initialPersistedState, {
      name: "tokimeki-mastodon", // name of the item in the storage (must be unique)
      partialize(state) {
        return omit(state, ["actions"]);
      },
    }),
    { name: "main-store" }
  )
);
