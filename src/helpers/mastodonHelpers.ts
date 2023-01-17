import { pick } from "lodash-es";
import type { mastodon } from "masto";
import type { AbortSignal as NodeFetchSignal } from "node-fetch/externals";

import type { TK_Account, TK_Relationship } from "../store";

export function makeAccountName(account: TK_Account) {
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

  async fetchAccount(id: string, signal?: Signal) {
    return pickTokimekiAccount(
      await this.client.http.get<mastodon.v1.Account>(
        `/api/v1/accounts/${id}`,
        {},
        { signal }
      )
    );
  }
  async fetchRelationships(ids: readonly string[], signal?: Signal) {
    return [
      ...(await this.client.http.get<mastodon.v1.Relationship[]>(
        `/api/v1/accounts/relationships`,
        { ids },
        {
          signal,
        }
      )),
    ].map((i) => pickTokimekiRelationship(i));
  }

  async listFollowing(
    id: string,
    params: mastodon.DefaultPaginationParams = {}
  ) {
    return [...(await this.client.v1.accounts.listFollowing(id, params))].map(
      (i) => pickTokimekiAccount(i)
    );
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

  unfollow(id: string) {
    return this.client.v1.accounts.unfollow(id);
  }
}

export function pickTokimekiRelationship(
  relationship: mastodon.v1.Relationship | TK_Relationship
): TK_Relationship {
  return pick(relationship, ["followedBy", "note"]);
}

export function pickTokimekiAccount(
  account: mastodon.v1.Account | TK_Account
): TK_Account {
  const base = pick(account, [
    "id",
    "acct",
    "note",
    "avatar",
    "displayName",
    "username",
    "url",
    "emojis",
  ]);
  return {
    ...base,
    emojis: base.emojis.map((e) => pick(e, ["shortcode", "url"])),
  };
}
