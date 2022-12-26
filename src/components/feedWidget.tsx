import { useMemo } from "react";

interface FeedWidgetProps {
  width: number;
  height: number;
  theme: "dark" | "light" | "auto";
  showBoosts: boolean;
  showReplies: boolean;
  showHeader: boolean;
  url: string;
}

export function FeedWidget(props: FeedWidgetProps) {
  const { width, height, theme, showBoosts, showReplies, showHeader, url } =
    props;

  const iframeSrc = useMemo(() => {
    const frameUrl = new URL("https://www.mastofeed.com/apiv2/feed");
    const params = new URLSearchParams({
      userurl: url,
      theme,
      header: String(showHeader),
      boosts: String(showBoosts),
      replies: String(showReplies),
      size: "100",
    }).toString();

    frameUrl.search = params;

    return frameUrl.toString();
  }, [showBoosts, showHeader, showReplies, theme, url]);

  return (
    <iframe
      sandbox="allow-top-navigation allow-scripts"
      width={width}
      height={height}
      src={iframeSrc}
    ></iframe>
  );
}
