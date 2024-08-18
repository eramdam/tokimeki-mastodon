import clsx from "clsx";
import type { Text } from "domhandler";
import type { DOMNode, HTMLReactParserOptions } from "html-react-parser";
import { attributesToProps, domToReact, Element } from "html-react-parser";
import type { mastodon } from "masto";
import { mergeProps } from "react-aria";

import { renderWithEmoji } from "./emojify";

interface GetParserOptionsProps {
  emojiArray: mastodon.v1.CustomEmoji[];
  classNames?: {
    p?: string;
    a?: string;
  };
}
export function getParserOptions(options: GetParserOptionsProps) {
  const { emojiArray, classNames } = options;
  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        return renderWithEmoji(emojiArray, (domNode as Text).data);
      }

      if (domNode instanceof Element) {
        if (domNode.tagName === "br") {
          return <br />;
        }
        if (domNode.tagName === "a") {
          const anchorProps = mergeProps(attributesToProps(domNode.attribs), {
            className: clsx("text-blue-500 hover:underline", classNames?.a),
            target: "_blank",
            rel: "noreferrer noopener",
          });
          return (
            <a {...anchorProps}>
              {domToReact(domNode.children as DOMNode[], parseOptions)}
            </a>
          );
        }
        if (domNode.tagName === "p") {
          return (
            <p className={clsx("leading-normal last:mb-0", classNames?.p)}>
              {domToReact(domNode.children as DOMNode[], parseOptions)}
            </p>
          );
        }
      }

      return domNode;
    },
  };

  return parseOptions;
}
