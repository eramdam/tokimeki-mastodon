import type { mastodon } from "masto";
import { type CommonServiceState, createCustomStore } from "./common";
import { useMemo } from "react";
import { filterFollowingIds, sortFollowings } from "./helpers";
import { compact, pick, uniq } from "lodash-es";
import type { TokimekiAccount } from "./common";
import { useMainStore, type SortOrders } from "./mainStore";

type MastodonState = CommonServiceState & {
  /** Mastodon app client id */
  clientId: string | undefined;
  /** Mastodon app client secret */
  clientSecret: string | undefined;
  /** Mastodon instance URL */
  instanceUrl: string | undefined;
  /** Access token for the current app */
  accessToken: string | undefined;
  /** ID of the current account */
  accountId: string | undefined;
  /** Username of the current account (before the @domain.com part) */
  accountUsername: string | undefined;
  /** Lists belonging to the logged-in user. */
  lists: mastodon.v1.List[];
};

export const initialMastodonState: MastodonState = {
  clientId: undefined,
  clientSecret: undefined,
  instanceUrl: undefined,
  accessToken: undefined,
  accountId: undefined,
  accountUsername: undefined,
  lists: [],
  currentAccount: undefined,
  currentAccountListIds: undefined,
  currentRelationship: undefined,
  nextAccount: undefined,
  nextAccountListIds: undefined,
  nextRelationship: undefined,
  baseFollowingIds: [],
  followingIds: [],
  keptIds: [],
  unfollowedIds: [],
  startCount: 0,
};

export const useMastodonStore = createCustomStore(
  initialMastodonState,
  "mastodon",
);

export const useMastodonCurrentAccountListIds = () =>
  useMastodonStore((state) => state.currentAccountListIds);
export const useMastodonCurrentAccountRelationship = () =>
  useMastodonStore((state) => state.currentRelationship);
export const useMastodonCurrentAccount = () =>
  useMastodonStore((state) => state.currentAccount);

export const useMastodonLists = () => useMastodonStore((state) => state.lists);
export const useMastodonListById = (id: string | undefined) => {
  return useMastodonStore((state) => state.lists.find((l) => l.id === id));
};
export const useMastodonAccountId = () =>
  useMastodonStore((state) => state.accountId);
export const useMastodonAccountUsername = () =>
  useMastodonStore((state) => state.accountUsername);
export const useMastodonKeptIds = () =>
  useMastodonStore((state) => state.keptIds);
export const useMastodonUnfollowedIds = () =>
  useMastodonStore((state) => state.unfollowedIds);
export const useMastodonStartCount = () =>
  useMastodonStore((state) => state.startCount || 0);
export const useMastodonInstanceUrl = () =>
  useMastodonStore((state) => state.instanceUrl?.replace(/\/$/, ""));
export const useMastodonAccessToken = () =>
  useMastodonStore((state) => state.accessToken);
export const useMastodonOAuthCodeDependencies = () =>
  useMastodonStore((state) => {
    return {
      clientId: state.clientId,
      clientSecret: state.clientSecret,
      instanceUrl: state.instanceUrl,
    };
  });

export const useMastodonFollowingIds = () =>
  useMastodonStore((state) => state.followingIds);
export const useMastodonBaseFollowings = () =>
  useMastodonStore((state) => state.baseFollowingIds);
export const useMastodonFilteredFollowings = () => {
  const baseFollowings = useMastodonFollowingIds();
  const keptIds = useMastodonKeptIds();
  const unfollowedIds = useMastodonUnfollowedIds();

  return useMemo(
    () => filterFollowingIds(baseFollowings, keptIds, unfollowedIds),
    [baseFollowings, keptIds, unfollowedIds],
  );
};

export const useMastodonCurrentIndex = () => {
  const currentAccount = useMastodonCurrentAccount();
  const followings = useMastodonFollowingIds();

  if (!currentAccount) {
    return 0;
  }

  return followings.indexOf(currentAccount.id);
};

export const useMastodonKeptAccounts = () => {
  const baseFollowings = useMastodonFollowingIds();
  const keptIds = useMastodonKeptIds();

  return useMemo(
    () => baseFollowings.filter((a) => keptIds?.includes(a)),
    [baseFollowings, keptIds],
  );
};

export function makeTokimekiAccountFromMastodonAccount(
  account: mastodon.v1.Account | TokimekiAccount,
): TokimekiAccount {
  return pick(account, [
    "id",
    "acct",
    "note",
    "displayName",
    "username",
    "url",
    "emojis",
  ]);
}

export async function createMastodonList(
  client: mastodon.rest.Client,
  name: string,
) {
  const newList = await client.v1.lists.create({
    title: name,
  });
  const currentLists = useMastodonStore.getState().lists;
  useMastodonStore.setState({
    lists: [...currentLists, newList],
  });
}

export function unfollowMastodonAccount(accountId: string): void {
  useMastodonStore.setState((state) => ({
    unfollowedIds: uniq([...(state.unfollowedIds || []), accountId]),
  }));
}

export function keepMastodonAccount(accountId: string): void {
  useMastodonStore.setState((state) => ({
    keptIds: uniq([...(state.keptIds || []), accountId]),
  }));
}

export async function fetchMastodonFollowings(
  accountId: string,
  client: mastodon.rest.Client,
) {
  useMainStore.setState({ isFetching: true });
  const persistedState = useMastodonStore.getState();

  if (persistedState.baseFollowingIds.length) {
    const sortedFollowings = sortFollowings(
      filterFollowingIds(
        persistedState.baseFollowingIds,
        persistedState.keptIds,
        persistedState.unfollowedIds,
      ),
      useMainStore.getState().settings.sortOrder,
    );
    useMastodonStore.setState({
      currentAccount: undefined,
      currentAccountListIds: undefined,
      currentRelationship: undefined,
      nextAccount: undefined,
      nextRelationship: undefined,
      nextAccountListIds: undefined,
      followingIds: sortedFollowings,
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

    useMastodonStore.setState({
      currentAccount,
      currentRelationship,
      currentAccountListIds,
      nextAccount,
      nextRelationship,
      nextAccountListIds,
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
  const sortedFollowings = sortFollowings(
    accountIds,
    useMainStore.getState().settings.sortOrder,
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

  useMastodonStore.setState({
    baseFollowingIds: accountIds,
    followingIds: sortedFollowings,
    currentAccount:
      (firstAccount && makeTokimekiAccountFromMastodonAccount(firstAccount)) ||
      undefined,
    currentAccountListIds,
    nextAccount:
      (secondAccount &&
        makeTokimekiAccountFromMastodonAccount(secondAccount)) ||
      undefined,
    nextAccountListIds,
  });

  const relationships = await client.v1.accounts.relationships.fetch({
    id: compact([firstAccount?.id]),
  });
  const currentRelationship = relationships[0]
    ? pick(relationships[0], ["followedBy", "note", "showingReblogs"])
    : undefined;

  useMastodonStore.setState({
    currentRelationship,
  });
  useMainStore.setState({
    isFetching: false,
  });
}

export function reorderMastodonFollowings(order: SortOrders): void {
  useMastodonStore.setState((state) => ({
    followingIds: sortFollowings(state.baseFollowingIds, order),
  }));
}

export async function setCurrentMastodonAccountEmpty() {
  useMastodonStore.setState({
    currentAccount: undefined,
  });
}

export async function goToNextMastodonAccount(
  client: mastodon.rest.Client,
  currentAccount: TokimekiAccount,
) {
  const { followingIds, nextAccount, nextRelationship } =
    useMastodonStore.getState();

  const currentIndex = followingIds.indexOf(currentAccount.id);
  const newAccountId =
    nextAccount?.id ?? (followingIds[currentIndex + 1] || followingIds[0]);
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

  useMastodonStore.setState({
    currentAccount: makeTokimekiAccountFromMastodonAccount(newAccount),
    currentRelationship,
    currentAccountListIds,
  });

  const nextAccountId = followingIds[currentIndex + 2];

  if (!nextAccountId) {
    return;
  }

  client.v1.accounts
    .$select(nextAccountId)
    .fetch()
    .then((newNextAccount) => {
      useMastodonStore.setState({
        nextAccount: makeTokimekiAccountFromMastodonAccount(newNextAccount),
      });
    });
  client.v1.accounts.relationships
    .fetch({ id: [nextAccountId] })
    .then((newNextRelationship) => {
      const newNextRelationshipPicked = newNextRelationship[0]
        ? pick(newNextRelationship[0], ["followedBy", "note", "showingReblogs"])
        : undefined;
      useMastodonStore.setState({
        nextRelationship: newNextRelationshipPicked,
      });
    });
}

export function markAsFinished(): void {
  useMainStore.setState({ isFinished: true });
}

export async function fetchMastodonLists(client: mastodon.rest.Client) {
  const lists = await client.v1.lists.list();
  useMastodonStore.setState({ lists });
}

export function saveMastodonLoginCredentials(payload: {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
}): void {
  useMastodonStore.setState({
    clientId: payload.clientId,
    clientSecret: payload.clientSecret,
    instanceUrl: payload.instanceUrl,
  });
}

export function saveMastodonAfterOAuthCode(payload: {
  accessToken: string;
  account: mastodon.v1.AccountCredentials;
}): void {
  useMastodonStore.setState({
    accessToken: payload.accessToken,
    accountId: payload.account.id,
    accountUsername: payload.account.username,
    startCount: payload.account.followingCount,
  });
}
