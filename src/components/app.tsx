import { signal } from "@preact/signals";
import type { SubmitEventHandler } from "preact";
import { useState } from "preact/hooks";
import { registerMastodonApplication } from "../helpers/mastodon";

const instanceUrl = signal("");

export function App() {
  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const { clientId, clientSecret } = await registerMastodonApplication(
        instanceUrl.value,
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
        <label for="">
          Instance domain
          <input
            type="text"
            name="instanceUrl"
            required
            value={instanceUrl.value}
            onInput={(e) => {
              const val = e.currentTarget.value;
              instanceUrl.value = val.startsWith("https://")
                ? val
                : `https://${val}`;
            }}
          />
        </label>
        <button type="submit">Login</button>
      </form>
    </>
  );
}
