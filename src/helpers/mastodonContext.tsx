import type { mastodon } from "masto";
import { createRestAPIClient } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  useAccessToken,
  useAccountId,
  useInstanceUrl,
} from "../store/selectors";

const MastodonContext = createContext<{
  client: mastodon.rest.Client | undefined;
  accountId: string | null;
}>({ client: undefined, accountId: null });

export const MastodonProvider = (props: PropsWithChildren<object>) => {
  const accessToken = useAccessToken();
  const accountId = useAccountId();
  const instanceUrl = useInstanceUrl();
  const [masto, setMasto] = useState<mastodon.rest.Client | undefined>();

  useEffect(() => {
    if (!accessToken || !instanceUrl) {
      return;
    }

    const mastoClient = createRestAPIClient({
      url: instanceUrl,
      accessToken: accessToken,
    });
    setMasto(mastoClient);
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
