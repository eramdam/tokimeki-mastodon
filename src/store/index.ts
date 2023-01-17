import { omit } from "lodash-es";
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
  avatar: string;
  note: string;
  displayName: string;
  username: string;
  url: string;
  emojis: TokimekiEmoji[];
}

export interface TokimekiEmoji {
  shortcode: string;
  url: string;
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
  nextAccount?: TokimekiAccount;
  baseFollowingIds: string[];
  followingIds: string[];
  isFinished: boolean;
  currentRelationship?: TokimekiRelationship;
  nextRelationship?: TokimekiRelationship;
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
};

export const usePersistedStore = create<TokimekiState>()(
  devtools(
    persist(() => initialPersistedState, {
      name: "tokimeki-mastodon", // name of the item in the storage (must be unique)
      partialize(state) {
        return omit(state, ["actions", "nextAccount", "nextRelationship"]);
      },
      version: 1,
    }),
    { name: "main-store" }
  )
);
