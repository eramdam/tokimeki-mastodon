import { omit, uniq } from "lodash-es";
import type { mastodon } from "masto";
import create from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import shallow from "zustand/shallow";

import { SortOrders } from "./helpers/storageHelpers";

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
  };
}

const initialState: BaseTokimekiState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
  },
};

const usePersistedStore = create<PersistedTokimekiState>()(
  persist(
    (set, get) => ({
      ...initialState,
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
              settings: initialState.settings,
              actions: state.actions,
            };
          }, true);
        },
      },
    }),
    {
      name: "tokimeki-mastodon", // name of the item in the storage (must be unique)
      partialize(state) {
        return omit(state, ["actions"]);
      },
    }
  )
);

export const useAccount = () => usePersistedStore((state) => state.account);
export const useAccountId = () =>
  usePersistedStore((state) => state.account?.id);
export const useKeptIds = () => usePersistedStore((state) => state.keptIds);
export const useUnfollowedIds = () =>
  usePersistedStore((state) => state.unfollowedIds);
export const useActions = () => usePersistedStore((state) => state.actions);
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
