import type { DeepPartial } from "es-toolkit/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BaseStoreState = {
  service: "fedi" | "bluesky";
  isFinished: boolean;
  settings: {
    sortOrder: "oldest" | "newest" | "random";
    showBio: boolean;
    showFollowLabel: boolean;
    skipConfirmation: boolean;
  };
};

type BlueskyStore = BaseStoreState & {
  service: "bluesky";
  reviewType: "follows";
};

type FediState = {
  service: "fedi";
  isFinished: boolean;
  reviewType: "follows" | "followers" | "follow_requests";
  settings: {
    sortOrder: "oldest" | "newest" | "random";
    showBio: boolean;
    showFollowLabel: boolean;
    skipConfirmation: boolean;
    showNote: boolean;
  };
  credentials: {
    clientId: string;
    instanceUrl: string;
    clientSecret: string;
    accessToken: string;
  };
};

type Store = BlueskyStore | FediState;

export const useStore = create<Store>()(
  persist(
    (_get, _state) => {
      return {
        service: "fedi",
        isFinished: false,
        reviewType: "follows",
        settings: {
          sortOrder: "oldest",
          showBio: false,
          showFollowLabel: false,
          skipConfirmation: false,
          showNote: false,
        },
        credentials: {
          clientId: "",
          instanceUrl: "",
          clientSecret: "",
          accessToken: "",
        },
      };
    },
    {
      version: 1,
      name: "tokiv2",
    },
  ),
);

export const setStore = (s: DeepPartial<Store>) => {
  const store = useStore.getState();
  return useStore.setState(Object.assign(store, s), true);
};

export const storeActions = {
  saveFediCredentials(creds: {
    clientId: string;
    instanceUrl: string;
    clientSecret: string;
  }) {
    const store = useStore.getState();

    if (store.service === "fedi") {
      setStore({
        credentials: creds,
      });
    }
  },
  saveFediAccessToken(accessToken: string) {
    const store = useStore.getState();
    if (store.service === "fedi") {
      setStore({
        credentials: {
          accessToken: accessToken,
        },
      });
    }
  },
};
