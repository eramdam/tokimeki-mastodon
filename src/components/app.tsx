import type { SubmitEventHandler } from "react";
import { useEffect, useState } from "react";
import { mastodonHelpers } from "../helpers/mastodon";
import { storeActions } from "../store";

export function App() {
  const [instanceUrl, setInstanceUrl] = useState("");
  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const { clientId, clientSecret } =
        await mastodonHelpers.registerMastodonApplication(
          instanceUrl,
          window.location.origin,
        );
      console.log({ clientId, clientSecret });

      if (clientId && clientSecret) {
        const savedInstanceUrl = instanceUrl.replace(/\/$/, "");
        storeActions.saveFediCredentials({
          instanceUrl: savedInstanceUrl,
          clientId,
          clientSecret,
        });

        location.href = mastodonHelpers.getAuthURL({
          instanceUrl: savedInstanceUrl,
          clientId,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onMastodonCode = (code: string) => {};

  useEffect(() => {
    const codeFromURL = new URLSearchParams(window.location.search).get("code");
    if (codeFromURL) {
      onMastodonCode(codeFromURL);
    }
  });

  return (
    <>
      <form onSubmit={onSubmit}>
        <label>
          Instance domain
          <input
            type="text"
            name="instanceUrl"
            required
            value={instanceUrl}
            onInput={(e) => {
              const val = e.currentTarget.value;
              setInstanceUrl(
                val.startsWith("https://") ? val : `https://${val}`,
              );
            }}
          />
        </label>
        <button type="submit">Login</button>
      </form>
    </>
  );
}
