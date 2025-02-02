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
        defer
        data-domain="tokimeki.erambert.me"
        src="https://plausible.erambert.me/js/script.js"
      ></Script>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
