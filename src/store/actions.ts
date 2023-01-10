import { compact, pick, uniq } from "lodash-es";
import type { mastodon } from "masto";

import type { SortOrders, TokimekiAccount, TokimekiState } from ".";
import { initialPersistedState, usePersistedStore } from ".";
import { filterFollowingIds, sortFollowings } from "./selectors";

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
    accountId: payload.account.id,
    accountUsername: payload.account.username,
    startCount: payload.account.followingCount,
  });
}

export function updateSettings(
  payload: Partial<TokimekiState["settings"]>
): void {
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
) {
  usePersistedStore.setState({ isFetching: true });
  const persistedState = usePersistedStore.getState();

  if (persistedState.baseFollowingIds.length) {
    const sortedFollowings = sortFollowings(
      filterFollowingIds(
        persistedState.baseFollowingIds,
        persistedState.keptIds,
        persistedState.unfollowedIds
      ),
      usePersistedStore.getState().settings.sortOrder
    );
    usePersistedStore.setState({
      currentAccount: undefined,
      currentRelationship: undefined,
      nextAccount: undefined,
      nextRelationship: undefined,
      followingIds: sortedFollowings,
    });

    const [firstAccountId, secondAccountId] = sortedFollowings;
    const idsToFetch = compact([firstAccountId, secondAccountId]);
    const accountPromises = idsToFetch.map((id) => {
      return client.v1.accounts.fetch(id);
    });
    const relationshipsPromises =
      client.v1.accounts.fetchRelationships(idsToFetch);
    const [currentAccount, nextAccount] = await Promise.all(accountPromises);
    const [currentRelationship, nextRelationship] = await relationshipsPromises;

    usePersistedStore.setState({
      currentAccount,
      currentRelationship,
      nextAccount,
      nextRelationship,
    });

    return;
  }

  const accounts: mastodon.v1.Account[] = [];

  if (accounts.length === 0) {
    for await (const followings of client.v1.accounts.listFollowing(accountId, {
      limit: 80,
    })) {
      accounts.push(...followings);
    }
  }

  const accountIds = accounts.map((a) => a.id);
  const sortedFollowings = sortFollowings(
    accountIds,
    usePersistedStore.getState().settings.sortOrder
  );

  const firstId = sortedFollowings[0] || "";
  const firstAccount = accounts.find((a) => a.id === firstId);
  const secondId = sortedFollowings[1] || "";
  const secondAccount = accounts.find((a) => a.id === secondId);

  usePersistedStore.setState({
    baseFollowingIds: accountIds,
    followingIds: sortedFollowings,
    currentAccount:
      (firstAccount &&
        pick(firstAccount, [
          "id",
          "acct",
          "note",
          "displayName",
          "url",
          "emojis",
        ])) ||
      undefined,
    nextAccount:
      (secondAccount &&
        pick(secondAccount, [
          "id",
          "acct",
          "note",
          "displayName",
          "url",
          "emojis",
        ])) ||
      undefined,
  });

  const relationships = await client.v1.accounts.fetchRelationships(
    compact([firstAccount?.id])
  );
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note"])
    : undefined;

  usePersistedStore.setState({
    isFetching: false,
    currentRelationship,
  });
}
export function reorderFollowings(order: SortOrders): void {
  usePersistedStore.setState((state) => ({
    followingIds: sortFollowings(state.baseFollowingIds, order),
  }));
}
export async function setCurrentAccountEmpty() {
  usePersistedStore.setState({
    currentAccount: undefined,
  });
}
export async function goToNextAccount(
  client: mastodon.Client,
  currentAccount: TokimekiAccount
) {
  const { followingIds, nextAccount, nextRelationship } =
    usePersistedStore.getState();

  const currentIndex = followingIds.indexOf(currentAccount.id);
  const newAccountId =
    nextAccount?.id ?? (followingIds[currentIndex + 1] || followingIds[0]);
  const newAccount =
    nextAccount ?? (await client.v1.accounts.fetch(newAccountId || ""));
  const relationships = nextRelationship
    ? [nextRelationship]
    : await client.v1.accounts.fetchRelationships(compact([newAccountId]));
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note"])
    : undefined;

  usePersistedStore.setState({
    currentAccount: pick(newAccount, [
      "id",
      "acct",
      "note",
      "displayName",
      "url",
      "emojis",
    ]),
    currentRelationship,
  });

  const nextAccountId = followingIds[currentIndex + 2];

  if (!nextAccountId) {
    return;
  }

  client.v1.accounts.fetch(nextAccountId).then((newNextAccount) => {
    usePersistedStore.setState({
      nextAccount: pick(newNextAccount, [
        "id",
        "acct",
        "note",
        "displayName",
        "url",
        "emojis",
      ]),
    });
  });
  client.v1.accounts
    .fetchRelationships([nextAccountId])
    .then((newNextRelationship) => {
      const newNextRelationshipPicked = newNextRelationship[0]
        ? pick(newNextRelationship[0], ["followedBy", "note"])
        : undefined;
      usePersistedStore.setState({
        nextRelationship: newNextRelationshipPicked,
      });
    });
}
export function markAsFinished(): void {
  usePersistedStore.setState({ isFinished: true });
}
