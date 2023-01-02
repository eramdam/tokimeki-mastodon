import localforage from "localforage";
import type { mastodon } from "masto";
import { useEffect, useState } from "react";

interface StoredItems {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  accessToken: string;
  account: mastodon.v1.AccountCredentials;
  startCount: number;
  followingIds: string[];
  unfollowedIds: string[];
  keptIds: string[];
}

export function setStoredItem<K extends keyof StoredItems>(
  key: K,
  value: StoredItems[K]
) {
  return localforage.setItem(key, value);
}

export function getStoredItem<K extends keyof StoredItems>(
  key: K
): Promise<StoredItems[K] | null> {
  return localforage.getItem<StoredItems[K]>(key);
}

export function useItemFromLocalForage<K extends keyof StoredItems>(
  key: K,
  options?: {
    defaultValue: StoredItems[K];
    debug?: boolean;
  }
): StoredItems[K];
export function useItemFromLocalForage<K extends keyof StoredItems>(
  key: K,
  options?: {
    debug?: boolean;
  }
) {
  const [item, setItem] = useState<StoredItems[K] | null>(null);

  useEffect(() => {
    localforage.ready().then(() => {
      getStoredItem(key).then((value) => setItem(value));
    });

    return;
  }, [key, options?.debug]);

  if (options?.debug) {
    console.log(key, { item });
  }

  if (options && "defaultValue" in options && !item) {
    return options.defaultValue;
  }

  return item;
}

export function clearStorage() {
  localforage.clear();
}
