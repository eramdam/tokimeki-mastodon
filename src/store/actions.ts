import {
  camelCase,
  chunk,
  compact,
  flatten,
  keyBy,
  mapKeys,
  uniq,
} from "lodash-es";
import type { mastodon } from "masto";

import type { SortOrders, TokimekiState } from ".";
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

  if (persistedState.baseFollowings.length) {
    const existingRelationships = persistedState.relationships;
    usePersistedStore.setState({
      followings: sortFollowings(
        persistedState.baseFollowings,
        usePersistedStore.getState().settings.sortOrder
      ),
    });

    const missingIds = persistedState.baseFollowings
      .filter((a) => !existingRelationships[a.id])
      .map((a) => a.id);

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

  usePersistedStore.setState({
    baseFollowings: accounts,
    followings: sortFollowings(
      accounts,
      usePersistedStore.getState().settings.sortOrder
    ),
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

interface FetchRelationshipsOptions {
  ids: string[];
  state: TokimekiState;
}

// Hack to get around https://github.com/neet/masto.js/issues/672
async function fetchRelationships(opts: FetchRelationshipsOptions) {
  const { ids, state } = opts;

  const chunks = chunk(ids, 40);

  return keyBy(
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
