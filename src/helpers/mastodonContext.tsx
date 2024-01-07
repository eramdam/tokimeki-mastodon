import { createRestAPIClient } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  useAccessToken,
  useAccountId,
  useInstanceUrl,
} from "../store/selectors";
import type { MastodonClient } from "./typeHelpers";

const MastodonContext = createContext<{
  client: MastodonClient | undefined;
  accountId: string | null;
}>({ client: undefined, accountId: null });

export const MastodonProvider = (props: PropsWithChildren<object>) => {
  const accessToken = useAccessToken();
  const accountId = useAccountId();
  const instanceUrl = useInstanceUrl();
  const [masto, setMasto] = useState<MastodonClient | undefined>();

  useEffect(() => {
    if (!accessToken || !instanceUrl) {
      return;
    }

    console.log({
      url: instanceUrl,
      accessToken: accessToken,
    });
    const client = createRestAPIClient({
      url: instanceUrl,
      accessToken: accessToken,
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
