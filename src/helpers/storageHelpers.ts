import localForage from "localforage";
import { extendPrototype } from "localforage-observable";
import type { mastodon } from "masto";
import { useEffect, useRef, useState } from "react";
import Observable from "zen-observable";

const localforage = extendPrototype(localForage);
localforage.newObservable.factory = function (subscribeFn) {
  // @ts-expect-error TODO
  return new Observable(subscribeFn);
};

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
    debug?: boolean;
  }
) {
  const [item, setItem] = useState<StoredItems[K] | null>(null);
  const observable = useRef<ReturnType<
    typeof localforage.newObservable
  > | null>(null);

  useEffect(() => {
    localforage.ready().then(() => {
      getStoredItem(key).then((value) => setItem(value));
      if (!observable.current) {
        observable.current = localforage.newObservable({
          key,
        });

        observable.current.subscribe({
          next: (value) => {
            if (options?.debug) {
              console.log("Got a new value!", value);
            }
            setItem(value.newValue);
          },
          error: function (err) {
            console.log("Found an error!", err);
          },
          complete: function () {
            console.log("Observable destroyed!");
          },
        });
      }
    });

    return;
  }, [key, options?.debug]);

  if (options?.debug) {
    console.log(key, { item });
  }

  return item;
}

export function clearStorage() {
  localforage.clear();
}
