import type { mastodon } from "masto";
import { login } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  useAccessToken,
  useAccountId,
  useInstanceUrl,
} from "../store/selectors";

const MastodonContext = createContext<{
  client: mastodon.Client | undefined;
  accountId: string | null;
}>({ client: undefined, accountId: null });

export const MastodonProvider = (props: PropsWithChildren<object>) => {
  const accessToken = useAccessToken();
  const accountId = useAccountId();
  const instanceUrl = useInstanceUrl();
  const [masto, setMasto] = useState<mastodon.Client | undefined>();

  useEffect(() => {
    if (!accessToken || !instanceUrl) {
      return;
    }

    login({
      url: instanceUrl,
      accessToken: accessToken,
      disableVersionCheck: true,
    }).then((mastoClient) => {
      setMasto(mastoClient);
    });
  }, [accessToken, instanceUrl]);

  const value = useMemo(() => {
    return {
      client: masto,
      accountId: accountId || null,
    };
  }, [accountId, masto]);

  return (
    <MastodonContext.Provider value={value}>
      {props.children}
    </MastodonContext.Provider>
  );
};

export function useMastodon() {
  return useContext(MastodonContext);
}
