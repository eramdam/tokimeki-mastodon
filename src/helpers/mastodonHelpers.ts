import { uniqBy } from "lodash-es";
import type { mastodon } from "masto";

export async function getFollowings(masto: mastodon.Client) {
  const account = await masto.v1.accounts.verifyCredentials();

  const accounts: Array<mastodon.v1.Account> = [];

  for await (const followings of masto.v1.accounts.listFollowing(account.id)) {
    accounts.push(...followings);
  }

  return uniqBy(accounts, "id");
}
