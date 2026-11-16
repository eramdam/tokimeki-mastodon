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

export const mastodonHelpers = {
  getAuthURL(opts: { clientId: string; instanceUrl: string }) {
    const authorizationParams = new URLSearchParams({
      client_id: opts.clientId,
      scope: OAUTH_SCOPES,
      redirect_uri: `${location.origin}`,
      response_type: "code",
    });
    const authorizationURL = `https://${opts.instanceUrl.replace(
      /https?:\/\//,
      "",
    )}/oauth/authorize?${authorizationParams.toString()}`;

    return authorizationURL;
  },
  async registerMastodonApplication(instanceURL: string, origin: string) {
    const masto = createRestAPIClient({
      url: instanceURL,
    });

    return await masto.v1.apps.create({
      clientName: "TOKIV2",
      redirectUris: `${origin}`,
      scopes: OAUTH_SCOPES,
      website: origin,
    });
  },
  async fetchMastoFollowsForAccount(accountId: string) {
    const followedAccounts: mastodon.v1.Account[] = [];
    for await (const followings of mastoClient.v1.accounts
      .$select(accountId)
      .following.list({
        limit: 40,
      })) {
      followedAccounts.push(...followings);
    }

    return followedAccounts;
  },
  async getMastoAccountId() {
    const profile = await mastoClient.v1.profile.fetch();
    return profile.id;
  },
  async getAccessToken(opts: {
    clientId: string;
    instanceUrl: string;
    clientSecret: string;
    code: string;
  }): Promise<{ access_token: string } | null> {
    const params = new URLSearchParams({
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: location.origin,
      grant_type: "authorization_code",
      code: opts.code,
      scope: OAUTH_SCOPES,
    });
    const tokenResponse = await fetch(
      `https://${opts.instanceUrl.replace(/https?:\/\//, "")}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    const tokenJSON = await tokenResponse.json();
    return tokenJSON;
  },
};
