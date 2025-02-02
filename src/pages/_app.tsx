import "../styles/globals.css";

import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import Script from "next/script";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Tokimeki Mastodon</title>
      </Head>
      <Script
        defer
        data-domain="tokimeki.erambert.me"
        src="https://plausible.erambert.me/js/script.js"
      ></Script>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
