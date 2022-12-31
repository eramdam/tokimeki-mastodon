import type { mastodon } from "masto";
import { login } from "masto";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useItemFromLocalForage } from "./storageHelpers";

const MastodonContext = createContext<{
  client: mastodon.Client | undefined;
  account: mastodon.v1.Account | null;
}>({ client: undefined, account: null });

export const MastodonProvider = (props: PropsWithChildren<object>) => {
  const accessToken = useItemFromLocalForage("accessToken");
  const account = useItemFromLocalForage("account");
  const instanceUrl = useItemFromLocalForage("instanceUrl");
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

  const value = useMemo(
    () => ({
      client: masto,
      account,
    }),
    [account, masto]
  );

  return (
    <MastodonContext.Provider value={value}>
      {props.children}
    </MastodonContext.Provider>
  );
};

export function useMastodon() {
  return useContext(MastodonContext);
}
