import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { useEffect } from "react";
import { SSRProvider } from "react-aria";
import { initLocalForage } from "../helpers/storageHelpers";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    initLocalForage();
  }, []);

  return (
    <SSRProvider>
      <Head>
        <title>Tokimeki Mastodon</title>
      </Head>
      <Component {...pageProps} />
    </SSRProvider>
  );
};

export default MyApp;
