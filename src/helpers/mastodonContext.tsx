import { createRestAPIClient } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useRef } from "react";

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
  const clientRef = useRef<MastodonClient | null>(null);

  useEffect(() => {
    if (!accessToken || !instanceUrl || clientRef.current) {
      return;
    }

    const client = createRestAPIClient({
      url: instanceUrl,
      accessToken: accessToken,
    });
    clientRef.current = client;
  }, [accessToken, instanceUrl]);

  return (
    <MastodonContext.Provider
      value={{
        client: clientRef.current || undefined,
        accountId: accountId || null,
      }}
    >
      {props.children}
    </MastodonContext.Provider>
  );
};

export function useMastodon() {
  return useContext(MastodonContext);
}
