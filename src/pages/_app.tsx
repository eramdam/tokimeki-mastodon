import "../styles/globals.css";

import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import Script from "next/script";
import { SSRProvider } from "react-aria";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SSRProvider>
      <Head>
        <title>Tokimeki Mastodon</title>
      </Head>
      <Script
        async
        src="https://umami-ochre-two.vercel.app/script.js"
        data-website-id="51e9d456-88f4-4589-99b4-26eed5a94055"
      ></Script>
      <Component {...pageProps} />
    </SSRProvider>
  );
};

export default MyApp;
