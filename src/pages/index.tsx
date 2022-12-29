import type { ValidationState } from "@react-types/shared";
import localforage from "localforage";
import type { mastodon } from "masto";
import { login } from "masto";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components/button";
import { Block } from "../components/main";
import { TextInput } from "../components/textField";
import {
    getAccessToken,
    getAuthURL,
    registerApplication
} from "../helpers/authHelpers";

const Home: NextPage = () => {
  const [instanceUrl, setInstanceDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isInstanceValid: ValidationState | undefined = useMemo(() => {
    try {
      new URL(instanceUrl);
      return "valid";
    } catch (e) {
      return "invalid";
    }
  }, [instanceUrl]);

  const onCode = useCallback(
    async (code: string) => {
      setIsLoading(true);
      const clientId = await localforage.getItem<string>("clientId");
      const clientSecret = await localforage.getItem<string>("clientSecret");
      const instanceUrl = await localforage.getItem<string>("instanceUrl");

      if (!clientId || !clientSecret || !instanceUrl) {
        return;
      }

      const accessTokenResponse = await getAccessToken({
        clientId,
        clientSecret,
        code,
        instanceUrl,
      });

      if (!accessTokenResponse) {
        return;
      }

      const { access_token } = accessTokenResponse;

      if (!access_token) {
        return;
      }

      await localforage.setItem("accessToken", access_token);
      const masto = await login({
        url: instanceUrl,
        accessToken: access_token,
        timeout: 30_000,
      });
      const account = await masto.v1.accounts.verifyCredentials();
      await localforage.setItem("account", account);
      router.push("/review");
    },
    [router]
  );

  useEffect(() => {
    const accountPromise =
      localforage.getItem<mastodon.v1.AccountCredentials>("account");

    accountPromise.then((accessToken) => {
      if (accessToken) {
        router.push("/review");
        return;
      }
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        return;
      }

      onCode(code);
    });
  });

  const onLogin = async () => {
    if (!isInstanceValid) {
      return;
    }

    setIsLoading(true);

    try {
      const { clientId, clientSecret } = await registerApplication(
        instanceUrl,
        window.location.origin
      );

      if (clientId && clientSecret) {
        await localforage.setItem("instanceUrl", instanceUrl);
        await localforage.setItem("clientId", clientId);
        await localforage.setItem("clientSecret", clientSecret);

        location.href = getAuthURL({
          instanceUrl,
          clientId,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Block className="flex flex-col items-center justify-center">
      <Head>
        <title>Tokimeki Mastodon</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-accentColor text-center">
        ✨ Welcome to Tokimeki Mastodon ✨
      </h1>
      <p className="prose dark:prose-invert">
        Following too many accounts? You&apos;re in the right place!
      </p>
      <p className="prose dark:prose-invert">
        This tool is inspired by{" "}
        <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
        which has become my preferred way to clean my Twitter followings.
        Unfortunately there was no equivalent for Mastodon... Until now!
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
        className="my-10 flex w-full max-w-lg flex-col gap-5"
      >
        <TextInput
          label="Instance URL"
          placeholder="https://"
          type={"url"}
          className="prose flex flex-col gap-2 text-center dark:prose-invert"
          value={instanceUrl}
          onChange={setInstanceDomain}
          validationState={isInstanceValid || "valid"}
          isDisabled={isLoading}
        ></TextInput>
        <div className="flex justify-center">
          <Button
            variant="primary"
            type="submit"
            isDisabled={isInstanceValid === "invalid" || isLoading}
          >
            {(isLoading && "Loading...") || "Login"}
          </Button>
        </div>
      </form>
    </Block>
  );
};

export default Home;
