import { type AppType } from "next/dist/shared/lib/utils";
import { SSRProvider } from "react-aria";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
  );
};

export default MyApp;
