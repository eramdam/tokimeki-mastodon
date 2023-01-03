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

export enum SortOrders {
  OLDEST = "oldest",
  RANDOM = "random",
  NEWEST = "newest",
}
