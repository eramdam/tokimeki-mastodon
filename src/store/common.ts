import {
  createJSONStorage,
  devtools,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { createWithEqualityFn } from "zustand/traditional";
import type { mastodon } from "masto";

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, "has been retrieved");
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, "with value", value, "has been saved");
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, "has been deleted");
    await del(name);
  },
};

const CURRENT_STORE_VERSION = 1;

export function createCustomStore<T>(initialState: T, name: string) {
  return createWithEqualityFn<T>()(
    devtools(
      persist(() => initialState, {
        name,
        version: CURRENT_STORE_VERSION,
        storage: createJSONStorage(() => idbStorage),
      }),
      {
        name,
      },
    ),
  );
}
export type CommonServiceState = {
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

export interface TokimekiAccount {
  id: string;
  acct: string;
  note: string;
  displayName: string;
  username: string;
  url: string;
  emojis: mastodon.v1.CustomEmoji[];
}

export interface TokimekiRelationship {
  followedBy: boolean;
  note?: string | null;
  showingReblogs: boolean;
}
