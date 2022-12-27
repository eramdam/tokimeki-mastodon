import { Node, Text } from "domhandler";
/* eslint-disable @next/next/no-img-element */
import "@github/relative-time-element";
import type { HTMLReactParserOptions } from "html-react-parser";
import parse, {
  attributesToProps,
  domToReact,
  Element,
} from "html-react-parser";
import { compact } from "lodash-es";
import type { mastodon } from "masto";
import { useRef, useState } from "react";
import { mergeProps, useButton } from "react-aria";
import { BlurhashImage } from "./blurhashImage";
import { SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import clsx from "clsx";
import { isElement } from "../helpers/domHelpers";

interface StatusProps {
  status: mastodon.v1.Status;
  booster?: mastodon.v1.Account;
}

export function Status(props: StatusProps) {
  const { booster, status } = props;

  const initialIsCollapsed = !!status.spoilerText;
  const [isCollapsed, setIsCollapsed] = useState(initialIsCollapsed);
  const [areMediaHidden, setAreMediaHidden] = useState(
    status.sensitive || initialIsCollapsed
  );
  const mediaWrapperRef = useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(
    {
      onPress: () => {
        setAreMediaHidden(false);
      },
    },
    mediaWrapperRef
  );

  const eligibleMedia = status.mediaAttachments.filter((m) => m.blurhash);
  const mediaRenders = compact(
    eligibleMedia.map((m) => {
      if (!m.blurhash) {
        return null;
      }

      return (
        <div
          key={m.id}
          className="relative overflow-hidden rounded-md object-cover"
        >
          <BlurhashImage
            isHidden={areMediaHidden}
            imgClassname="relative top-0 left-0 h-full w-full object-cover z-10"
            canvasClassname="absolute top-0 left-0 h-full w-full object-cover"
            width={m.meta?.small?.width || 0}
            height={m.meta?.small?.height || 0}
            description={m.description || ""}
            src={m.previewUrl}
            hash={m.blurhash}
          ></BlurhashImage>
        </div>
      );
    })
  );

  const parseOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Text) {
        return renderWithEmoji(status.emojis, domNode.data);
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

  return (
    <a
      key={status.id}
      className="border-b-[1px] border-neutral-300 p-2 font-sans no-underline hover:bg-neutral-100"
      href={status.url || ""}
      target="_blank"
      rel="noreferrer noopener"
      onClickCapture={(e) => {
        if (isElement(e.target)) {
          if (
            e.target instanceof HTMLButtonElement ||
            e.target.closest("button")
          ) {
            e.preventDefault();
            return;
          }
        }
      }}
    >
      {booster && (
        <div className="text-xs text-neutral-500">
          🔁 {booster.displayName} boosted
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <div className="relative">
          <img
            alt={status.account.displayName}
            src={status.account.avatar}
            className="-mt-2 h-8 w-8 rounded-md"
          />
          {booster && (
            <img
              alt={booster.displayName}
              src={booster.avatar}
              className="absolute -bottom-2 -right-2 -mt-2 h-6 w-6 rounded-md border-2 border-white"
            />
          )}
        </div>

        <div className="mb-2 flex flex-col gap-1 truncate">
          <span className="truncate text-base leading-tight">
            {renderWithEmoji(status.account.emojis, status.account.displayName)}
          </span>
          <span className="truncate text-xs leading-tight">
            {status.account.acct}
          </span>
        </div>

        <div className="flex-1 flex-shrink"></div>

        <div className="self-start">
          <relative-time
            // @ts-expect-error - relative-time-element is not typed properly
            class="text-xs leading-tight"
            datetime={status.createdAt}
            tense="past"
            format="micro"
          ></relative-time>
        </div>
      </div>
      {initialIsCollapsed && (
        <SmallButton
          variant="secondary"
          className="mb-2"
          onPress={() => {
            setIsCollapsed((p) => !p);
          }}
        >
          {status.spoilerText} {isCollapsed ? "➕" : "➖"}
        </SmallButton>
      )}
      {(!isCollapsed && (
        <div className="text-sm">{parse(status.content, parseOptions)}</div>
      )) ||
        null}
      {(mediaRenders.length && (
        <button
          className="relative mt-4 mb-2 flex gap-1"
          {...buttonProps}
          ref={mediaWrapperRef}
        >
          <SmallButton
            variant="monochrome"
            className={clsx(
              "absolute",
              areMediaHidden &&
                "top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2",
              !areMediaHidden && "top-1 left-1 z-20"
            )}
            onPress={() => {
              setAreMediaHidden((p) => !p);
            }}
          >
            {areMediaHidden ? "Sensitive content" : "Hide"}
          </SmallButton>
          {mediaRenders}
        </button>
      )) ||
        null}
    </a>
  );
}
