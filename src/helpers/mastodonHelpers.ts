import type { mastodon } from "masto";
import type { AbortSignal as NodeFetchSignal } from "node-fetch/externals";

import type { TokimekiAccount } from "../store";

export function makeAccountName(account: TokimekiAccount) {
  return (
    account.displayName.trim() || account.username.trim() || account.acct.trim()
  );
}

export type Signal = AbortSignal | NodeFetchSignal;

export class MastodonWrapper {
  private client: mastodon.Client;

  constructor(client: mastodon.Client) {
    this.client = client;
  }

  async verifyCredentials() {
    return this.client.http.get<mastodon.v1.AccountCredentials>(
      `/api/v1/accounts/verify_credentials`
    );
  }

  async fetchAccount(id: string) {
    return this.client.http.get<mastodon.v1.Account>(`/api/v1/accounts/${id}`);
  }
  async fetchRelationships(ids: readonly string[]) {
    return this.client.http.get<mastodon.v1.Relationship[]>(
      `/api/v1/accounts/relationships`,
      { ids }
    );
  }

  listFollowing(id: string, params: mastodon.DefaultPaginationParams = {}) {
    return this.client.v1.accounts.listFollowing(id, params);
  }

  async listAllFollowings(
    id: string,
    params: mastodon.DefaultPaginationParams = {}
  ) {
    const accounts: mastodon.v1.Account[] = [];

    if (accounts.length === 0) {
      for await (const followings of this.client.v1.accounts.listFollowing(id, {
        limit: 80,
        ...params,
      })) {
        accounts.push(...followings);
      }
    }

    return accounts;
  }

  listStatuses(
    ...args: Parameters<typeof this.client.v1.accounts.listStatuses>
  ) {
    return this.client.v1.accounts.listStatuses(...args);
  }

  unfollow(...args: Parameters<typeof this.client.v1.accounts.unfollow>) {
    return this.client.v1.accounts.unfollow(...args);
  }
}
