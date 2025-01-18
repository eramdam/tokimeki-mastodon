import { createCustomStore } from "./common";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}

export enum Services {
  MASTODON = "mastodon",
  BLUESKY = "bluesky",
}

export type MainState = {
  settings: {
    showBio: boolean;
    showNote: boolean;
    showFollowLabel: boolean;
    sortOrder: SortOrders;
    skipConfirmation: boolean;
  };
  isFetching: boolean;
  isFinished: boolean;
  service: Services;
};

export const initialMainState: MainState = {
  settings: {
    sortOrder: SortOrders.OLDEST,
    showBio: false,
    showNote: false,
    showFollowLabel: false,
    skipConfirmation: false,
  },
  isFetching: false,
  isFinished: false,
  service: Services.MASTODON,
};

export const useMainStore = createCustomStore(initialMainState, "main-store");
