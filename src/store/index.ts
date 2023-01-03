import { omit, shuffle, uniq } from "lodash-es";
import type { mastodon } from "masto";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import shallow from "zustand/shallow";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}

interface BaseTokimekiState {
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
    sortOrder: SortOrders;
  };
  isFetching: boolean;
  currentIndex: number;
  baseFollowings: mastodon.v1.Account[];
  followings: mastodon.v1.Account[];
}

interface PersistedTokimekiState extends BaseTokimekiState {
  actions: {
    saveLoginCredentials(payload: {
      clientId: string;
      clientSecret: string;
      instanceUrl: string;
    }): void;
    saveAfterOAuthCode(payload: {
      accessToken: string;
      account: mastodon.v1.AccountCredentials;
      startCount: number;
    }): void;
    updateSettings(payload: {
      showBio?: boolean;
      sortOrder?: SortOrders;
    }): void;
    unfollowAccount(accountId: string): void;
    keepAccount(accountId: string): void;
    resetState(): void;
    fetchFollowings(
      accountId: string,
      client: mastodon.Client
    ): Promise<mastodon.v1.Account[]>;
    reorderFollowings(order: SortOrders): void;
    goToNextAccount(): void;
  };
}

export const initialPersistedState: BaseTokimekiState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
  },
  isFetching: false,
  currentIndex: 0,
  baseFollowings: [],
  followings: [],
};

const usePersistedStore = create<PersistedTokimekiState>()(
  devtools(
    persist(
      (set) => ({
        ...initialPersistedState,
        actions: {
          saveLoginCredentials(payload) {
            set({
              clientId: payload.clientId,
              clientSecret: payload.clientSecret,
              instanceUrl: payload.instanceUrl,
            });
          },
          saveAfterOAuthCode(payload) {
            set({
              accessToken: payload.accessToken,
              account: payload.account,
              startCount: payload.startCount,
            });
          },
          updateSettings(payload) {
            set((state) => ({
              settings: {
                ...state.settings,
                ...payload,
              },
            }));
          },
          unfollowAccount(accountId) {
            set((state) => ({
              unfollowedIds: uniq([...(state.unfollowedIds || []), accountId]),
            }));
          },
          keepAccount(accountId) {
            set((state) => ({
              keptIds: uniq([...(state.keptIds || []), accountId]),
            }));
          },
          resetState() {
            return set((state) => {
              return {
                settings: initialPersistedState.settings,
                actions: state.actions,
              };
            }, true);
          },
          goToNextAccount: () => {
            set((state) => ({
              ...state,
              currentIndex: state.currentIndex + 1,
            }));
          },
          reorderFollowings: (order: SortOrders) => {
            set((state) => ({
              followings: sortFollowings(state.baseFollowings, order),
              currentIndex: 0,
            }));
          },
          fetchFollowings: async (accountId, client) => {
            set({ isFetching: true });
            const accounts: mastodon.v1.Account[] = [];

            if (accounts.length === 0) {
              for await (const followings of client.v1.accounts.listFollowing(
                accountId,
                {
                  limit: 80,
                }
              )) {
                accounts.push(...followings);
              }
            }

            set({
              baseFollowings: accounts,
              isFetching: false,
              followings: sortFollowings(
                accounts,
                initialPersistedState.settings.sortOrder
              ),
            });
            return accounts;
          },
        },
      }),
      {
        name: "tokimeki-mastodon", // name of the item in the storage (must be unique)
        partialize(state) {
          return omit(state, ["actions"]);
        },
      }
    ),
    { name: "main-store" }
  )
);

export const useAccount = () => usePersistedStore((state) => state.account);
export const useAccountId = () =>
  usePersistedStore((state) => state.account?.id);
export const useKeptIds = () => usePersistedStore((state) => state.keptIds);
export const useUnfollowedIds = () =>
  usePersistedStore((state) => state.unfollowedIds);
export const useTokimekiActions = () =>
  usePersistedStore((state) => state.actions);
export const useSettings = () => usePersistedStore((state) => state.settings);
export const useStartCount = () =>
  usePersistedStore((state) => state.startCount || 0);
export const useInstanceUrl = () =>
  usePersistedStore((state) => state.instanceUrl);
export const useAccessToken = () =>
  usePersistedStore((state) => state.accessToken);

export const useOAuthCodeDependencies = () =>
  usePersistedStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  }, shallow);

export const useFilteredFollowings = () => {
  const baseFollowings = usePersistedStore((state) => state.followings);
  const keptIds = useKeptIds();
  const unfollowedIds = useUnfollowedIds();

  return filterFollowings(baseFollowings, keptIds, unfollowedIds);
};

export const useCurrentAccount = () => {
  const currentIndex = useCurrentIndex();
  const followings = useFilteredFollowings();

  return followings[currentIndex] || followings[0];
};

export const useCurrentIndex = () =>
  usePersistedStore((state) => state.currentIndex);
export const useIsFetching = () =>
  usePersistedStore((state) => state.isFetching);
export const useKeptAccounts = () => {
  const baseFollowings = usePersistedStore((state) => state.followings);
  const keptIds = useKeptIds();

  return baseFollowings.filter((a) => keptIds?.includes(a.id));
};

/*
 * Helpers.
 */

function filterFollowings(
  array: mastodon.v1.Account[],
  keptIds: string[] | null | undefined,
  unfollowedIds: string[] | null | undefined
) {
  return array.filter((a) => {
    return !keptIds?.includes(a.id) && !unfollowedIds?.includes(a.id);
  });
}

function sortFollowings(array: mastodon.v1.Account[], sortOrder: SortOrders) {
  switch (sortOrder) {
    case SortOrders.NEWEST: {
      return array;
    }
    case SortOrders.OLDEST: {
      const newArray = [...array];
      newArray.reverse();
      return newArray;
    }
    case SortOrders.RANDOM: {
      return shuffle([...array]);
    }
  }
}
