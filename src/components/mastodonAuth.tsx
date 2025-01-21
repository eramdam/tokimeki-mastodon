import { useCallback, useEffect, useMemo, useState } from "react";
import {
  registerMastodonApplication,
  getAuthURL,
  getMastodonAccessToken,
} from "../helpers/authHelpers";
import {
  saveMastodonAfterOAuthCode,
  saveMastodonLoginCredentials,
  useMastodonAccountId,
  useMastodonOAuthCodeDependencies,
} from "../store/mastodonStore";
import { Button } from "./button";
import { TextInput } from "./textField";
import type { ValidationState } from "react-stately";
import { useRouter } from "next/router";
import { createRestAPIClient } from "masto";

export function MastodonAuthForm() {
  const [localInstanceUrl, setInstanceDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    clientId,
    clientSecret,
    instanceUrl: storedInstanceUrl,
  } = useMastodonOAuthCodeDependencies();
  const isInstanceValid: ValidationState | undefined = useMemo(() => {
    try {
      new URL(localInstanceUrl);
      return "valid";
    } catch (_e) {
      return "invalid";
    }
  }, [localInstanceUrl]);

  const onLogin = async () => {
    if (!isInstanceValid || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { clientId, clientSecret } = await registerMastodonApplication(
        localInstanceUrl.replace(/\/$/, ""),
        window.location.origin,
      );

      if (clientId && clientSecret) {
        saveMastodonLoginCredentials({
          instanceUrl: localInstanceUrl.replace(/\/$/, ""),
          clientId,
          clientSecret,
        });

        location.href = getAuthURL({
          instanceUrl: localInstanceUrl.replace(/\/$/, ""),
          clientId,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onCode = useCallback(
    async (code: string) => {
      setIsLoading(true);

      if (!clientId || !clientSecret || !storedInstanceUrl) {
        return;
      }

      const accessTokenResponse = await getMastodonAccessToken({
        clientId,
        clientSecret,
        code,
        instanceUrl: storedInstanceUrl,
      });

      if (!accessTokenResponse) {
        return;
      }

      const { access_token } = accessTokenResponse;

      if (!access_token) {
        return;
      }

      const masto = createRestAPIClient({
        url: storedInstanceUrl,
        accessToken: access_token,
        timeout: 30_000,
      });
      const account = await masto.v1.accounts.verifyCredentials();
      saveMastodonAfterOAuthCode({
        accessToken: access_token,
        account,
      });
      router.push("/review");
    },
    [clientId, clientSecret, router, storedInstanceUrl],
  );

  const account = useMastodonAccountId();

  useEffect(() => {
    if (account) {
      router.push("/review");
      return;
    }
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      return;
    }

    onCode(code);
  }, [account, onCode, router]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLogin();
      }}
      className="my-10 mb-2 flex w-full max-w-lg flex-col gap-5"
    >
      <TextInput
        label="Instance domain"
        placeholder="https://"
        type={"url"}
        className="custom-prose flex flex-col gap-2 text-center"
        value={localInstanceUrl}
        onChange={(value) => {
          setInstanceDomain(
            value.startsWith("https://") ? value : `https://${value}`,
          );
        }}
        isInvalid={(isInstanceValid || "valid") === "invalid"}
        isDisabled={isLoading}
      ></TextInput>
      <div className="flex justify-center">
        <Button
          variant="primary"
          type="submit"
          onPress={() => {
            onLogin();
          }}
          isDisabled={isInstanceValid === "invalid" || isLoading}
        >
          {(isLoading && "Loading...") || "Login"}
        </Button>
      </div>
    </form>
  );
}
