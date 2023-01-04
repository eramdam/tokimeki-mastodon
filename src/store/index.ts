import { omit } from "lodash-es";
import type { mastodon } from "masto";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}

export interface TokimekiState {
  clientId?: string;
  clientSecret?: string;
  instanceUrl?: string;
  accessToken?: string;
  account?: mastodon.v1.AccountCredentials;
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
  currentIndex: number;
  baseFollowings: mastodon.v1.Account[];
  followings: mastodon.v1.Account[];
  isFinished: boolean;
  relationships: Record<string, mastodon.v1.Relationship>;
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
  currentIndex: 0,
  baseFollowings: [],
  followings: [],
  relationships: {},
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
