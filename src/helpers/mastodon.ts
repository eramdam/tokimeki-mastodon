import { createRestAPIClient, type mastodon } from "masto";

const OAUTH_SCOPES = [
  "read:follows",
  "write:follows",
  "read:accounts",
  "read:statuses",
  "read:lists",
  "write:lists",
].join(" ");

const mastoClient = createRestAPIClient({
  url: "https://social.erambert.me",
  accessToken: "6ORBUNJtFH5PgjF9NOfiTCxz8EFpxBHR21_yhBfoC18",
});

export async function getMastoAccountId() {
  const profile = await mastoClient.v1.profile.fetch();
  return profile.id;
}

export async function fetchMastoFollowsForAccount(accountId: string) {
  const followedAccounts: mastodon.v1.Account[] = [];
  for await (const followings of mastoClient.v1.accounts
    .$select(accountId)
    .following.list({
      limit: 40,
    })) {
    followedAccounts.push(...followings);
  }

  return followedAccounts;
}

export async function registerMastodonApplication(
  instanceURL: string,
  origin: string,
) {
  const masto = createRestAPIClient({
    url: instanceURL,
  });

  return await masto.v1.apps.create({
    clientName: "TOKIV2",
    redirectUris: `${origin}`,
    scopes: OAUTH_SCOPES,
    website: origin,
  });
}
