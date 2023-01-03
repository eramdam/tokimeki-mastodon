import { uniq } from "lodash-es";
import type { mastodon } from "masto";

import type { SortOrders } from ".";
import { initialPersistedState, usePersistedStore } from ".";
import { sortFollowings } from "./selectors";

export function resetState() {
  return usePersistedStore.setState(() => {
    return initialPersistedState;
  }, true);
}

export function saveLoginCredentials(payload: {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
}): void {
  usePersistedStore.setState({
    clientId: payload.clientId,
    clientSecret: payload.clientSecret,
    instanceUrl: payload.instanceUrl,
  });
}

export function saveAfterOAuthCode(payload: {
  accessToken: string;
  account: mastodon.v1.AccountCredentials;
}): void {
  usePersistedStore.setState({
    accessToken: payload.accessToken,
    account: payload.account,
    startCount: payload.account.followingCount,
  });
}

export function updateSettings(payload: {
  showBio?: boolean;
  sortOrder?: SortOrders;
}): void {
  usePersistedStore.setState((state) => ({
    settings: {
      ...state.settings,
      ...payload,
    },
  }));
}
export function unfollowAccount(accountId: string): void {
  usePersistedStore.setState((state) => ({
    unfollowedIds: uniq([...(state.unfollowedIds || []), accountId]),
  }));
}
export function keepAccount(accountId: string): void {
  usePersistedStore.setState((state) => ({
    keptIds: uniq([...(state.keptIds || []), accountId]),
  }));
}
export async function fetchFollowings(
  accountId: string,
  client: mastodon.Client
): Promise<mastodon.v1.Account[]> {
  usePersistedStore.setState({ isFetching: true });
  const accounts: mastodon.v1.Account[] = [];

  if (accounts.length === 0) {
    for await (const followings of client.v1.accounts.listFollowing(accountId, {
      limit: 80,
    })) {
      accounts.push(...followings);
    }
  }

  usePersistedStore.setState({
    baseFollowings: accounts,
    isFetching: false,
    followings: sortFollowings(
      accounts,
      usePersistedStore.getState().settings.sortOrder
    ),
  });
  return accounts;
}
export function reorderFollowings(order: SortOrders): void {
  usePersistedStore.setState((state) => ({
    followings: sortFollowings(state.baseFollowings, order),
    currentIndex: 0,
  }));
}
export function goToNextAccount(): void {
  usePersistedStore.setState((state) => ({
    ...state,
    currentIndex: state.currentIndex + 1,
  }));
}
export function markAsFinished(): void {
  usePersistedStore.setState({ isFinished: true });
}
