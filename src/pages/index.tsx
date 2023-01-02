import type { ValidationState } from "@react-types/shared";
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
  registerApplication,
} from "../helpers/authHelpers";
import { getStoredItem, setStoredItem } from "../helpers/storageHelpers";

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
      const clientId = await getStoredItem("clientId");
      const clientSecret = await getStoredItem("clientSecret");
      const instanceUrl = await getStoredItem("instanceUrl");

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

      await setStoredItem("accessToken", access_token);
      const masto = await login({
        url: instanceUrl,
        accessToken: access_token,
        timeout: 30_000,
      });
      const account = await masto.v1.accounts.verifyCredentials();
      await setStoredItem("account", account);
      await setStoredItem("startCount", account.followingCount);
      router.push("/review");
    },
    [router]
  );

  useEffect(() => {
    const accountPromise = getStoredItem("account");

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
        await setStoredItem("instanceUrl", instanceUrl);
        await setStoredItem("clientId", clientId);
        await setStoredItem("clientSecret", clientSecret);

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
    <>
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
          If you&apos;re like me, you have followed a lot of accounts over the
          years on Mastodon. Some of them date from years ago, you were a
          different human being! Some of them you feel like you *have* to keep
          following, and others you may have outgrown, but you never had the
          energy to clean up your follows.
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
      <Block>
        <div className="prose opacity-60 dark:prose-invert">
          <p>
            P.S. Tokimeki is the original word that was translated to
            &quot;spark joy&quot; in English. &quot;Spark joy&quot; doesn&apos;t
            fully capture the meaning, which is why there are all these caveats
            whenever someone explains it, like I&apos;m doing here. Please treat
            this term as inclusive of anything you enjoy or feel is important to
            you. Also, KonMari (TM) is trademark of Marie Kondo, and this tool
            is not affiliated with, nor does it profit off the use of the brand.
          </p>
          <p>
            P.P.S. This tool uses your browser&apos;s local storage (not
            cookies) to store your progress. This tool uses your Mastodon&apos;s
            account authorization to fetch your followings, their toots and
            unfollow accounts. The code is{" "}
            <a href="https://github.com/eramdam/tokimeki-mastodon">
              open source and hosted on GitHub.
            </a>
          </p>
          <p>
            Based off{" "}
            <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
            by <a href="https://tarng.com/">Julius Tarng</a>.
            <br />
            <br />
            Made by <a href="https://erambert.me">Damien Erambert</a>. Find me
            at{" "}
            <a href="https://octodon.social/@eramdam">eramdam@octodon.social</a>
            !
          </p>
        </div>
      </Block>
    </>
  );
};

export default Home;
