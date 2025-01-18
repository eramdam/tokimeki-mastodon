import { createCustomStore } from "./common";

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
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
};

export const useMainStore = createCustomStore(initialMainState, "main-store");
