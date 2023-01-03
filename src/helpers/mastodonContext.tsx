import type { mastodon } from "masto";
import { login } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  useAccessToken,
  useAccount,
  useInstanceUrl,
} from "../store/tokimekiStore";

const MastodonContext = createContext<{
  client: mastodon.Client | undefined;
  account: mastodon.v1.Account | null;
}>({ client: undefined, account: null });

export const MastodonProvider = (props: PropsWithChildren<object>) => {
  const accessToken = useAccessToken();
  const account = useAccount();
  const instanceUrl = useInstanceUrl();
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

  const value = useMemo(() => {
    return {
      client: masto,
      account: account || null,
    };
  }, [account, masto]);

  return (
    <MastodonContext.Provider value={value}>
      {props.children}
    </MastodonContext.Provider>
  );
};

export function useMastodon() {
  return useContext(MastodonContext);
}
