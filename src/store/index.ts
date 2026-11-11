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
        },
      };
    },
    {
      version: 1,
      name: "tokiv2",
    },
  ),
);
