import type { NextPage } from "next";
import Head from "next/head";
import { Block } from "../components/block";
import { Radio, RadioGroup } from "../components/radioGroup";
import { APP_NAME } from "../helpers/common";
import { Services, setService, useMainStore } from "../store/mainStore";

const Home: NextPage = () => {
  const service = useMainStore((state) => state.service);

  return (
    <Block>
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
      <p className="custom-prose">PLACEHOLDER PARAGRAPH</p>
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
    </Block>
  );
};

export default Home;
