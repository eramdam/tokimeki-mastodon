import "../styles/globals.css";

import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import Script from "next/script";
import { APP_NAME } from "../helpers/common";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <Script
        async
        src="https://umami.erambert.me/script.js"
        data-website-id="51e9d456-88f4-4589-99b4-26eed5a94055"
      ></Script>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
