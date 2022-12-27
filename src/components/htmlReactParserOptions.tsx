import type { Text } from "domhandler";
import type { HTMLReactParserOptions } from "html-react-parser";
import { attributesToProps, domToReact, Element } from "html-react-parser";
import type { mastodon } from "masto";
import { mergeProps } from "react-aria";
import { renderWithEmoji } from "./emojify";

export function getParserOptions(emojiArray: mastodon.v1.CustomEmoji[]) {
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
            className: "text-blue-500 hover:underline",
            target: "_blank",
            rel: "noreferrer noopener",
          });
          return (
            <a {...anchorProps}>{domToReact(domNode.children, parseOptions)}</a>
          );
        }
        if (domNode.tagName === "p") {
          return (
            <p className="mb-4 leading-normal last:mb-0">
              {domToReact(domNode.children, parseOptions)}
            </p>
          );
        }
      }

      return domNode;
    },
  };

  return parseOptions;
}
