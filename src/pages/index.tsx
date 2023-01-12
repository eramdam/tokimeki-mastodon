import type { ValidationState } from "@react-types/shared";
import { login } from "masto";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import packageJson from "../../package.json";
import { Block } from "../components/block";
import { Button } from "../components/button";
import { TextInput } from "../components/textField";
import {
  getAccessToken,
  getAuthURL,
  registerApplication,
} from "../helpers/authHelpers";
import { saveAfterOAuthCode, saveLoginCredentials } from "../store/actions";
import { useAccountId, useOAuthCodeDependencies } from "../store/selectors";

const Home: NextPage = () => {
  const [localInstanceUrl, setInstanceDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    clientId,
    clientSecret,
    instanceUrl: storedInstanceUrl,
  } = useOAuthCodeDependencies();

  const isInstanceValid: ValidationState | undefined = useMemo(() => {
    try {
      new URL(localInstanceUrl);
      return "valid";
    } catch (e) {
      return "invalid";
    }
  }, [localInstanceUrl]);

  const onCode = useCallback(
    async (code: string) => {
      setIsLoading(true);

      if (!clientId || !clientSecret || !storedInstanceUrl) {
        return;
      }

      const accessTokenResponse = await getAccessToken({
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

      const masto = await login({
        url: storedInstanceUrl,
        accessToken: access_token,
        timeout: 30_000,
      });
      const account = await masto.v1.accounts.verifyCredentials();
      saveAfterOAuthCode({
        accessToken: access_token,
        account,
      });
      router.push("/review");
    },
    [clientId, clientSecret, router, storedInstanceUrl]
  );

  const account = useAccountId();

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

  const onLogin = async () => {
    if (!isInstanceValid || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { clientId, clientSecret } = await registerApplication(
        localInstanceUrl.replace(/\/$/, ""),
        window.location.origin
      );

      if (clientId && clientSecret) {
        saveLoginCredentials({
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

  return (
    <>
      <Block className="flex flex-col items-center justify-center">
        <Head>
          <title>Tokimeki Mastodon</title>
          <meta name="description" content="" />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <h1 className="text-accentColor text-center">
          ✨ Welcome to Tokimeki Mastodon ✨
        </h1>
        <p className="custom-prose">
          Following too many accounts? You&apos;re in the right place!
        </p>
        <p className="custom-prose">
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
          className="my-10 mb-2 flex w-full max-w-lg flex-col gap-5"
        >
          <TextInput
            label="Instance domain"
            placeholder="https://"
            type={"url"}
            className="custom-prose flex flex-col gap-2 text-center "
            value={localInstanceUrl}
            onChange={(value) => {
              setInstanceDomain(
                value.startsWith("https://") ? value : `https://${value}`
              );
            }}
            validationState={isInstanceValid || "valid"}
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
        <p className="custom-prose !w-full !max-w-full !text-sm opacity-60">
          This tool uses your Mastodon&apos;s account authorization to fetch
          your followings, their toots and unfollow accounts.
        </p>
      </Block>
      <Block className="lg:py-0">
        <div className="custom-prose !max-w-full !text-sm !leading-relaxed opacity-60">
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
            cookies) to store your progress. The code is{" "}
            <a href="https://github.com/eramdam/tokimeki-mastodon">
              open source and hosted on GitHub.
            </a>
          </p>
          <p className="!mb-2">
            Based off{" "}
            <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
            by <a href="https://tarng.com/">Julius Tarng</a>.
            <br />
            Made by <a href="https://erambert.me">Damien Erambert</a>. Find me
            at{" "}
            <a href="https://octodon.social/@eramdam">eramdam@octodon.social</a>
            !
          </p>
          <small className="inline-block w-full pb-2 text-center">
            Version {packageJson.version}
          </small>
        </div>
      </Block>
    </>
  );
};

export default Home;
