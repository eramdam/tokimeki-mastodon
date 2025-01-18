import { useMainStore } from "./index";

export const useIsFinished = () => useMainStore((state) => state.isFinished);
export const useSettings = () => useMainStore((state) => state.settings);
export const useIsFetching = () => useMainStore((state) => state.isFetching);
