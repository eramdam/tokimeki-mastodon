import localforage from "localforage";
import type { mastodon } from "masto";
import { useEffect, useState } from "react";

interface StoredItems {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  accessToken: string;
  account: mastodon.v1.AccountCredentials;
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
  key: K
): StoredItems[K] | null {
  const [item, setItem] = useState<StoredItems[K] | null>(null);

  useEffect(() => {
    getStoredItem(key).then((value) => setItem(value));
  }, [key]);

  return item;
}

export function clearStorage() {
  localforage.clear();
}
