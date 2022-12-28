import { uniqBy } from "lodash-es";
import type { mastodon } from "masto";
import { login } from "masto";
import { useEffect, useState } from "react";
import { useItemFromLocalForage } from "./storageHelpers";

export async function getFollowings(masto: mastodon.Client) {
  const account = await masto.v1.accounts.verifyCredentials();

  const accounts: Array<mastodon.v1.Account> = [];

  for await (const followings of masto.v1.accounts.listFollowing(account.id)) {
    accounts.push(...followings);
  }

  return uniqBy(accounts, "id");
}

export function useMastoClient() {
  const accessToken = useItemFromLocalForage<string>("accessToken");
  const instanceUrl = useItemFromLocalForage<string>("instanceUrl");
  const [masto, setMasto] = useState<mastodon.Client | undefined>();

  useEffect(() => {
    if (!accessToken || !instanceUrl) {
      return;
    }

    login({
      url: instanceUrl,
      accessToken: accessToken,
    }).then((mastoClient) => {
      setMasto(mastoClient);
    });
  }, [accessToken, instanceUrl]);

  return masto;
}
