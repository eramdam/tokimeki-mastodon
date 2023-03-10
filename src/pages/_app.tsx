import "../styles/globals.css";

import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { SSRProvider } from "react-aria";

const MyApp: AppType = ({ Component, pageProps }) => {
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
