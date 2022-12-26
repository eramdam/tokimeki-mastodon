import type { ValidationState } from "@react-types/shared";
import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { Button } from "../components/button";
import { TextInput } from "../components/textField";

const Home: NextPage = () => {
  const [instanceUrl, setInstanceDomain] = useState("");

  const isInstanceValid: ValidationState | undefined = useMemo(() => {
    if (!instanceUrl) {
      return undefined;
    }

    try {
      new URL(instanceUrl);
      return "valid";
    } catch (e) {
      return "invalid";
    }
  }, [instanceUrl]);

  return (
    <>
      <Head>
        <title>Tokimeki Mastodon</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 mx-auto flex max-w-2xl flex-col items-center gap-3 overflow-hidden rounded-lg bg-white p-4 shadow-xl">
        <h1 className="text-accentColor text-center">
          ✨ Welcome to Tokimeki Mastodon ✨
        </h1>
        <p className="prose">
          Following too many accounts? You&apos;re in the right place!
        </p>
        <p>
          This tool is inspired by{" "}
          <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a>{" "}
          which has become my preferred way to clean my Twitter followings.
          Unfortunately there was no equivalent for Mastodon... Until now!
        </p>
        <form
          onSubmit={() => {
            console.log("submit");
          }}
          className="my-10 flex w-full max-w-lg flex-col gap-5"
        >
          <TextInput
            label="Instance URL"
            placeholder="https://"
            type={"url"}
            className="flex flex-col gap-2 text-center "
            value={instanceUrl}
            onChange={setInstanceDomain}
            validationState={isInstanceValid || "valid"}
          ></TextInput>
          <div className="flex justify-center">
            <Button
              type="submit"
              onPress={() => {
                console.log("Neep");
              }}
              isDisabled={isInstanceValid === "invalid"}
            >
              Login
            </Button>
          </div>
        </form>
      </main>
    </>
  );
};

export default Home;
