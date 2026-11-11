import type { SubmitEventHandler } from "react";
import { useState } from "preact/hooks";
import { registerMastodonApplication } from "../helpers/mastodon";

export function App() {
  const [instanceUrl, setInstanceUrl] = useState("");
  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const { clientId, clientSecret } = await registerMastodonApplication(
        instanceUrl,
        window.location.origin,
      );
      console.log({ clientId, clientSecret });
    } catch (e) {
      console.error(e);
    }
  };
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
