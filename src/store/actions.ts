import { compact, pick, uniq } from "lodash-es";
import type { mastodon } from "masto";

import type { MainState, SortOrders, TokimekiAccount } from ".";
import {
  initialMainState,
  initialMastodonState,
  pickTokimekiAccount,
  useMainStore,
  useMastodonStore,
} from ".";
import { filterFollowingIds, sortFollowings } from "./selectors";

export function resetStates() {
  useMainStore.setState(() => {
    return initialMainState;
  }, true);
  useMastodonStore.setState(() => {
    return initialMastodonState;
  }, true);
}

export function saveLoginCredentials(payload: {
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

export function saveAfterOAuthCode(payload: {
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

export function updateSettings(payload: Partial<MainState["settings"]>): void {
  useMainStore.setState((state) => ({
    settings: {
      ...state.settings,
      ...payload,
    },
  }));
}
export function unfollowAccount(accountId: string): void {
  useMastodonStore.setState((state) => ({
    unfollowedIds: uniq([...(state.unfollowedIds || []), accountId]),
  }));
}
export function keepAccount(accountId: string): void {
  useMastodonStore.setState((state) => ({
    keptIds: uniq([...(state.keptIds || []), accountId]),
  }));
}
export async function fetchFollowings(
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

  useMastodonStore.setState({
    currentRelationship,
  });
  useMainStore.setState({
    isFetching: false,
  });
}
export function reorderFollowings(order: SortOrders): void {
  useMastodonStore.setState((state) => ({
    followingIds: sortFollowings(state.baseFollowingIds, order),
  }));
}
export async function setCurrentAccountEmpty() {
  useMastodonStore.setState({
    currentAccount: undefined,
  });
}
export async function goToNextAccount(
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
    currentAccount: pickTokimekiAccount(newAccount),
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
        nextAccount: pickTokimekiAccount(newNextAccount),
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

export async function fetchLists(client: mastodon.rest.Client) {
  const lists = await client.v1.lists.list();
  useMastodonStore.setState({ lists });
}

export async function createList(client: mastodon.rest.Client, name: string) {
  const newList = await client.v1.lists.create({
    title: name,
  });
  const currentLists = useMastodonStore.getState().lists;
  useMastodonStore.setState({
    lists: [...currentLists, newList],
  });
}
