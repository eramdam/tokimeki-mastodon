import { compact, pick, uniq } from "lodash-es";
import type { mastodon } from "masto";

import type {
  ReviewTypes,
  SortOrders,
  TokimekiAccount,
  TokimekiState,
} from ".";
import { pickTokimekiAccount } from ".";
import { initialPersistedState, usePersistedStore } from ".";
import { filterFollowingIds, sortAccounts } from "./selectors";

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

export async function saveAfterOAuthCode(payload: {
  accessToken: string;
  account: mastodon.v1.AccountCredentials;
  client: mastodon.rest.Client;
}): Promise<void> {
  const followRequests = await payload.client.v1.followRequests.list({
    limit: 1,
  });
  usePersistedStore.setState({
    accessToken: payload.accessToken,
    userAccountId: payload.account.id,
    userAccountUsername: payload.account.username,
    accountStats: {
      hasFollowers: payload.account.followersCount > 0,
      hasFollowings: payload.account.followingCount > 0,
      hasFollowRequests: followRequests.length > 0,
    },
  });
}

export function setReviewType(payload: ReviewTypes | undefined): void {
  usePersistedStore.setState((state) => {
    return {
      ...state,
      reviewType: payload,
      keptIds: initialPersistedState.keptIds,
      removedAccountIds: initialPersistedState.removedAccountIds,
      isFinished: initialPersistedState.isFinished,
      isFetching: initialPersistedState.isFetching,
      baseAccountIds: initialPersistedState.baseAccountIds,
      accountIds: initialPersistedState.accountIds,
      lists: initialPersistedState.lists,
      currentAccount: undefined,
      currentAccountListIds: undefined,
      currentRelationship: undefined,
      nextAccount: undefined,
      nextAccountListIds: undefined,
      nextRelationship: undefined,
    };
  });
}

export function updateSettings(
  payload: Partial<TokimekiState["settings"]>,
): void {
  usePersistedStore.setState((state) => ({
    settings: {
      ...state.settings,
      ...payload,
    },
  }));
}
export function removeAccount(accountId: string): void {
  usePersistedStore.setState((state) => ({
    removedAccountIds: uniq([...(state.removedAccountIds || []), accountId]),
  }));
}
export function keepAccount(accountId: string): void {
  usePersistedStore.setState((state) => ({
    keptIds: uniq([...(state.keptIds || []), accountId]),
  }));
}
export async function fetchFollowings(
  accountId: string,
  client: mastodon.rest.Client,
) {
  usePersistedStore.setState({ isFetching: true });
  const persistedState = usePersistedStore.getState();

  if (persistedState.baseAccountIds.length) {
    const sortedFollowings = sortAccounts(
      filterFollowingIds(
        persistedState.baseAccountIds,
        persistedState.keptIds,
        persistedState.removedAccountIds,
      ),
      usePersistedStore.getState().settings.sortOrder,
    );
    usePersistedStore.setState({
      currentAccount: undefined,
      currentAccountListIds: undefined,
      currentRelationship: undefined,
      nextAccount: undefined,
      nextRelationship: undefined,
      nextAccountListIds: undefined,
      accountIds: sortedFollowings,
    });

    const [firstAccountId, secondAccountId] = sortedFollowings;
    const accountIdsToFetch = compact([firstAccountId, secondAccountId]);
    const accountPromises = accountIdsToFetch.map((id) => {
      return client.v1.accounts.$select(id).fetch();
    });
    const relationshipsPromises = client.v1.accounts.relationships.fetch({
      id: accountIdsToFetch,
    });
    const [currentAccount, nextAccount] = await Promise.all(accountPromises);
    const [currentRelationship, nextRelationship] = await relationshipsPromises;
    const listPromises = accountIdsToFetch.map((id) => {
      return client.v1.accounts.$select(id).lists.list();
    });
    const [currentAccountListIds, nextAccountListIds] = (
      await Promise.all(listPromises)
    ).map((listsList) => listsList.map((l) => l.id));

    usePersistedStore.setState({
      currentAccount,
      currentRelationship,
      currentAccountListIds,
      nextAccount,
      nextRelationship,
      nextAccountListIds,
      startCount: sortedFollowings.length,
    });

    return;
  }

  const accounts: mastodon.v1.Account[] = [];

  if (accounts.length === 0) {
    for await (const followings of client.v1.accounts
      .$select(accountId)
      .following.list({
        limit: 80,
      })) {
      accounts.push(...followings);
    }
  }

  const accountIds = accounts.map((a) => a.id);
  const sortedFollowings = sortAccounts(
    accountIds,
    usePersistedStore.getState().settings.sortOrder,
  );

  const firstId = sortedFollowings[0] || "";
  const firstAccount = accounts.find((a) => a.id === firstId);
  const secondId = sortedFollowings[1] || "";
  const secondAccount = accounts.find((a) => a.id === secondId);
  const listPromises = [firstId, secondId].map((id) => {
    return client.v1.accounts.$select(id).lists.list();
  });
  const [currentAccountListIds, nextAccountListIds] = (
    await Promise.all(listPromises)
  ).map((listsList) => listsList.map((l) => l.id));

  usePersistedStore.setState({
    baseAccountIds: accountIds,
    accountIds: sortedFollowings,
    currentAccount:
      (firstAccount && pickTokimekiAccount(firstAccount)) || undefined,
    currentAccountListIds,
    nextAccount:
      (secondAccount && pickTokimekiAccount(secondAccount)) || undefined,
    nextAccountListIds,
  });

  const relationships = await client.v1.accounts.relationships.fetch({
    id: compact([firstAccount?.id]),
  });
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note", "showingReblogs"])
    : undefined;

  usePersistedStore.setState({
    isFetching: false,
    currentRelationship,
  });
}

export async function fetchFollowRequesters(
  _accountId: string,
  client: mastodon.rest.Client,
) {
  usePersistedStore.setState({ isFetching: true });
  const persistedState = usePersistedStore.getState();

  if (persistedState.baseAccountIds.length) {
    const sortedFollowRequesters = sortAccounts(
      filterFollowingIds(
        persistedState.baseAccountIds,
        persistedState.keptIds,
        persistedState.removedAccountIds,
      ),
      usePersistedStore.getState().settings.sortOrder,
    );
    usePersistedStore.setState({
      currentAccount: undefined,
      currentAccountListIds: undefined,
      currentRelationship: undefined,
      nextAccount: undefined,
      nextRelationship: undefined,
      nextAccountListIds: undefined,
      accountIds: sortedFollowRequesters,
    });
    const [firstAccountId, secondAccountId] = sortedFollowRequesters;
    const accountIdsToFetch = compact([firstAccountId, secondAccountId]);
    const accountPromises = accountIdsToFetch.map((id) => {
      return client.v1.accounts.$select(id).fetch();
    });

    const relationshipsPromises = client.v1.accounts.relationships.fetch({
      id: accountIdsToFetch,
    });

    const [currentAccount, nextAccount] = await Promise.all(accountPromises);
    const [currentRelationship, nextRelationship] = await relationshipsPromises;

    usePersistedStore.setState({
      currentAccount,
      currentRelationship,
      nextAccount,
      nextRelationship,
      startCount: sortedFollowRequesters.length,
    });

    return;
  }

  const accounts: mastodon.v1.Account[] = [];

  if (accounts.length === 0) {
    for await (const followRequests of client.v1.followRequests.list({
      limit: 80,
    })) {
      accounts.push(...followRequests);
    }
  }

  const accountIds = accounts.map((a) => a.id);
  const sortedFollowRequesters = sortAccounts(
    accountIds,
    usePersistedStore.getState().settings.sortOrder,
  );

  const firstId = sortedFollowRequesters[0] || "";
  const firstAccount = accounts.find((a) => a.id === firstId);
  const secondId = sortedFollowRequesters[1] || "";
  const secondAccount = accounts.find((a) => a.id === secondId);

  usePersistedStore.setState({
    baseAccountIds: accountIds,
    accountIds: sortedFollowRequesters,
    currentAccount:
      (firstAccount && pickTokimekiAccount(firstAccount)) || undefined,
    nextAccount:
      (secondAccount && pickTokimekiAccount(secondAccount)) || undefined,
    startCount: sortedFollowRequesters.length,
  });

  const relationships = await client.v1.accounts.relationships.fetch({
    id: compact([firstAccount?.id]),
  });
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note", "showingReblogs"])
    : undefined;

  usePersistedStore.setState({
    isFetching: false,
    currentRelationship,
  });
}

export function reorderAccounts(order: SortOrders): void {
  usePersistedStore.setState((state) => ({
    accountIds: sortAccounts(state.baseAccountIds, order),
  }));
}
export async function setCurrentAccountEmpty() {
  usePersistedStore.setState({
    currentAccount: undefined,
  });
}
export async function goToNextAccount(
  client: mastodon.rest.Client,
  currentAccount: TokimekiAccount,
) {
  const { accountIds, nextAccount, nextRelationship } =
    usePersistedStore.getState();

  const currentIndex = accountIds.indexOf(currentAccount.id);
  const newAccountId =
    nextAccount?.id ?? (accountIds[currentIndex + 1] || accountIds[0]);
  const newAccount =
    nextAccount ??
    (await client.v1.accounts.$select(newAccountId || "").fetch());
  const relationships = nextRelationship
    ? [nextRelationship]
    : await client.v1.accounts.relationships.fetch({
        id: compact([newAccountId]),
      });
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note", "showingReblogs"])
    : undefined;

  const currentAccountListIds = (
    await client.v1.accounts.$select(newAccount.id).lists.list()
  ).map((l) => l.id);

  usePersistedStore.setState({
    currentAccount: pickTokimekiAccount(newAccount),
    currentRelationship,
    currentAccountListIds,
  });

  const nextAccountId = accountIds[currentIndex + 2];

  if (!nextAccountId) {
    return;
  }

  client.v1.accounts
    .$select(nextAccountId)
    .fetch()
    .then((newNextAccount) => {
      usePersistedStore.setState({
        nextAccount: pickTokimekiAccount(newNextAccount),
      });
    });
  client.v1.accounts.relationships
    .fetch({ id: [nextAccountId] })
    .then((newNextRelationship) => {
      const newNextRelationshipPicked = newNextRelationship[0]
        ? pick(newNextRelationship[0], ["followedBy", "note", "showingReblogs"])
        : undefined;
      usePersistedStore.setState({
        nextRelationship: newNextRelationshipPicked,
      });
    });
}
export function markAsFinished(): void {
  usePersistedStore.setState({ isFinished: true });
}

export async function fetchLists(client: mastodon.rest.Client) {
  const lists = await client.v1.lists.list();
  usePersistedStore.setState({ lists });
}

export async function createList(client: mastodon.rest.Client, name: string) {
  const newList = await client.v1.lists.create({
    title: name,
  });
  const currentLists = usePersistedStore.getState().lists;
  usePersistedStore.setState({
    lists: [...currentLists, newList],
  });
}
