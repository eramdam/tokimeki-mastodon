import { createCustomStore } from "./common";
import { useMastodonStore, initialMastodonState } from "./mastodonStore";

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
export const useIsFinished = () => useMainStore((state) => state.isFinished);
export const useSettings = () => useMainStore((state) => state.settings);
export const useIsFetching = () => useMainStore((state) => state.isFetching);
export function resetStates() {
  useMainStore.setState(() => {
    return initialMainState;
  }, true);
  useMastodonStore.setState(() => {
    return initialMastodonState;
  }, true);
}

export function updateSettings(payload: Partial<MainState["settings"]>): void {
  useMainStore.setState((state) => ({
    settings: {
      ...state.settings,
      ...payload,
    },
  }));
}
