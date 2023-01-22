import "../styles/globals.css";

import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Tokimeki Mastodon</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
