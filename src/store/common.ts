import {
  createJSONStorage,
  devtools,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { createWithEqualityFn } from "zustand/traditional";

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
