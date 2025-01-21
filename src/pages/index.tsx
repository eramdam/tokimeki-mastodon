import { type NextPage } from "next";
import Head from "next/head";

import packageJson from "../../package.json";
import { Block } from "../components/block";
import { MastodonAuthForm } from "../components/mastodonAuth";
import { APP_NAME } from "../helpers/common";
import { Radio, RadioGroup } from "../components/radioGroup";
import { Services, setService, useMainStore } from "../store/mainStore";

const Home: NextPage = () => {
  const service = useMainStore((state) => state.service);
  return (
    <>
      <Block className="flex flex-col items-center justify-center">
        <Head>
          <title>{APP_NAME}</title>
          <meta name="description" content="" />
          <link rel="icon" href="/favicon.png" />
        </Head>
        <h1 className="text-accentColor text-center">
          ✨ Welcome to {APP_NAME} ✨
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
        <div className="custom-prose w-full">
          <RadioGroup
            label={"Which timeline do you want to clean today?"}
            value={service}
            onChange={(value) => setService(value as Services, false)}
          >
            <Radio value={Services.MASTODON}>Mastodon</Radio>
            <Radio value={Services.BLUESKY}>Bluesky</Radio>
          </RadioGroup>
        </div>
        {service === Services.MASTODON && <MastodonAuthForm />}
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
            <a href="https://social.erambert.me/@eramdam">
              eramdam@erambert.me
            </a>
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
