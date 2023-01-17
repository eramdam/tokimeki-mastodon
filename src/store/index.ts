import { omit } from "lodash-es";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}

export interface TK_Account {
  id: string;
  acct: string;
  avatar: string;
  note: string;
  displayName: string;
  username: string;
  url: string;
  emojis: TK_Emoji[];
}

export interface TK_Emoji {
  shortcode: string;
  url: string;
}

export interface TK_Relationship {
  followedBy: boolean;
  note?: string | null;
}

export interface TK_State {
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
  currentAccount?: TK_Account;
  nextAccount?: TK_Account;
  baseFollowingIds: string[];
  followingIds: string[];
  isFinished: boolean;
  currentRelationship?: TK_Relationship;
  nextRelationship?: TK_Relationship;
}

export const initialPersistedState: TK_State = {
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

export const usePersistedStore = create<TK_State>()(
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
