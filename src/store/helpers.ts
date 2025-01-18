import { shuffle } from "lodash-es";
import { SortOrders } from ".";

/*
 * Helpers.
 */

export function filterFollowingIds(
  array: string[],
  keptIds: string[] | null | undefined,
  unfollowedIds: string[] | null | undefined,
) {
  return array.filter((a) => {
    return !keptIds?.includes(a) && !unfollowedIds?.includes(a);
  });
}
export function sortFollowings(array: string[], sortOrder: SortOrders) {
  switch (sortOrder) {
    case SortOrders.NEWEST: {
      return array;
    }
    case SortOrders.OLDEST: {
      const newArray = [...array];
      newArray.reverse();
      return newArray;
    }
    case SortOrders.RANDOM: {
      return shuffle([...array]);
    }
  }
}
