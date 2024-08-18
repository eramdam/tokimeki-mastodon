import parse from "html-react-parser";
import type { mastodon } from "masto";
import { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { getParserOptions } from "./htmlReactParserOptions";

interface HtmlRendererProps {
  content: string;
  emojiArray: mastodon.v1.CustomEmoji[];
  classNames?: {
    p?: string;
    a?: string;
  };
}

export function HtmlRenderer(props: HtmlRendererProps) {
  const { content, emojiArray, classNames } = props;
  const parseOptions = useMemo(
    () => getParserOptions({ emojiArray, classNames }),
    [classNames, emojiArray],
  );

  return (
    <ErrorBoundary
      fallbackRender={() => {
        return <span>{content}</span>;
      }}
    >
      {parse(content, parseOptions)}
    </ErrorBoundary>
  );
}
