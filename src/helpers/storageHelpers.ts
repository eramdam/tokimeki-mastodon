import localforage from "localforage";
import { useEffect, useState } from "react";

export function initLocalForage() {
  localforage.setDriver([localforage.INDEXEDDB, localforage.LOCALSTORAGE]);
}

export function useItemFromLocalForage<T>(key: string): T | null {
  const [item, setItem] = useState<T | null>(null);

  useEffect(() => {
    localforage.getItem<T>(key).then((value) => setItem(value));
  }, [key]);

  return item;
}

export function clearStorage() {
  localforage.clear();
}
