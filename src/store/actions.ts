import {
  camelCase,
  chunk,
  compact,
  flatten,
  keyBy,
  mapKeys,
  mapValues,
  pick,
  uniq,
} from "lodash-es";
import type { mastodon } from "masto";

import type { SortOrders, TokimekiAccount, TokimekiState } from ".";
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
    const existingRelationships = persistedState.relationships;
    usePersistedStore.setState({
      followingIds: sortFollowings(
        persistedState.baseFollowingIds,
        usePersistedStore.getState().settings.sortOrder
      ),
    });

    const missingIds = persistedState.baseFollowingIds.filter(
      (a) => !existingRelationships[a]
    );

    if (missingIds.length) {
      const relationshipsMap = await fetchRelationships({
        ids: missingIds,
        state: usePersistedStore.getState(),
      });

      usePersistedStore.setState({
        isFetching: false,
        relationships: relationshipsMap,
      });
    }

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

  const sortedFollowings = sortFollowings(
    accounts.map((a) => a.id),
    usePersistedStore.getState().settings.sortOrder
  );
  const firstId = sortedFollowings[0] || "";
  const firstAccount = accounts.find((a) => a.id === firstId);

  usePersistedStore.setState({
    baseFollowingIds: accounts.map((a) => a.id),
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
  });

  const relationshipsMap = await fetchRelationships({
    ids: accounts.map((f) => f.id),
    state: usePersistedStore.getState(),
  });

  usePersistedStore.setState({
    isFetching: false,
    relationships: relationshipsMap,
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
  const { followingIds } = usePersistedStore.getState();

  const currentIndex = followingIds.indexOf(currentAccount.id);
  const newAccountId = followingIds[currentIndex + 1] || followingIds[0];
  const newAccount = await client.v1.accounts.fetch(newAccountId || "");

  usePersistedStore.setState(() => ({
    currentAccount: pick(newAccount, [
      "id",
      "acct",
      "note",
      "displayName",
      "url",
      "emojis",
    ]),
  }));
}
export function markAsFinished(): void {
  usePersistedStore.setState({ isFinished: true });
}

interface FetchRelationshipsOptions {
  ids: string[];
  state: TokimekiState;
}

// Hack to get around https://github.com/neet/masto.js/issues/672
async function fetchRelationships(opts: FetchRelationshipsOptions) {
  const { ids, state } = opts;

  const chunks = chunk(ids, 40);

  return mapValues(
    keyBy(
      compact(
        flatten(
          await Promise.all(
            chunks.map((chunk) => {
              return fetchRelationshipsBase({
                ids: chunk,
                state,
              });
            })
          )
        )
      ),
      (r) => r.id
    ),
    (r) => pick(r, ["followedBy", "note"])
  );
}
async function fetchRelationshipsBase(options: FetchRelationshipsOptions) {
  const params = new URLSearchParams();
  options.ids.forEach((id) => params.append("id[]", id));

  const rawResponse = await fetch(
    `${
      options.state.instanceUrl
    }/api/v1/accounts/relationships?${params.toString()}`,
    {
      headers: {
        Authorization: "Bearer " + options.state.accessToken,
      },
    }
  );
  const json = await rawResponse.json();

  if (!Array.isArray(json)) {
    return;
  }

  return json.map((r) => {
    return mapKeys(r, (_v, k) => camelCase(k)) as mastodon.v1.Relationship;
  });
}
