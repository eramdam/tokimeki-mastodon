/* eslint-disable @next/next/no-img-element */
import "@github/relative-time-element";

import clsx from "clsx";
import parse from "html-react-parser";
import { compact } from "lodash-es";
import type { mastodon } from "masto";
import { useMemo, useRef, useState } from "react";
import { useButton, usePress } from "react-aria";

import { isElement } from "../helpers/domHelpers";
import { BlurhashImage } from "./blurhashImage";
import { SmallButton } from "./button";
import { renderWithEmoji } from "./emojify";
import { getParserOptions } from "./htmlReactParserOptions";

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
  const mediaWrapperRef = useRef<HTMLDivElement | null>(null);
  const { buttonProps } = useButton(
    {
      onPress: () => {
        setAreMediaHidden(false);
      },
    },
    mediaWrapperRef
  );
  const hasUncachedMedia = status.mediaAttachments.some(
    (m) => m.type === "unknown"
  );
  const renderMediaText = () => {
    if (hasUncachedMedia) {
      return "Not available";
    }

    return areMediaHidden ? "Sensitive content" : "Hide";
  };

  const onPress = () => {
    if (!status.url) {
      return;
    }
    window.open(status.url, "_blank", "noopener,noreferrer");
  };

  const { pressProps } = usePress({
    onPress,
  });

  const eligibleMedia = status.mediaAttachments.filter((m) => m.blurhash);
  const mediaRenders = compact(
    eligibleMedia.map((m) => {
      if (!m.blurhash) {
        return null;
      }

      const isUncached = m.type === "unknown";

      return (
        <div
          key={m.id}
          className="relative w-full overflow-hidden rounded-md object-cover"
        >
          <BlurhashImage
            isUncached={isUncached}
            isHidden={areMediaHidden}
            imgClassname="relative top-0 left-0 h-full w-full object-cover z-10"
            canvasClassname="absolute top-0 left-0 h-full w-full object-cover"
            width={m.meta?.small?.width}
            height={m.meta?.small?.height}
            description={m.description || ""}
            src={m.previewUrl}
            hash={m.blurhash}
          ></BlurhashImage>
        </div>
      );
    })
  );

  const parseOptions = useMemo(
    () => getParserOptions({ emojiArray: status.emojis }),
    [status.emojis]
  );

  return (
    <article
      role="article"
      {...pressProps}
      className="cursor-pointer border-b-[1px] border-neutral-300 p-2 font-sans no-underline hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-white/5"
      onClickCapture={(e) => {
        if (isElement(e.target)) {
          if (e.target.matches("img")) {
            onPress();
            return;
          }
          if (e.target.closest("button, a")) {
            e.preventDefault();
            return;
          }
        }
      }}
    >
      {booster && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          🔁 {booster.displayName} boosted
        </div>
      )}
      <div className={clsx("flex items-center gap-3", booster && "pt-2")}>
        <div className="relative">
          <img
            alt={status.account.displayName}
            src={status.account.avatar}
            className="-mt-2 h-8 w-8 rounded-md bg-white"
          />
          {booster && (
            <img
              alt={booster.displayName}
              src={booster.avatar}
              className="absolute -bottom-2 -right-2 -mt-2 h-6 w-6 rounded-md border-2 border-white bg-white dark:border-neutral-800 dark:bg-neutral-800
              
              "
            />
          )}
        </div>

        <div className="mb-2 flex flex-col gap-1 truncate dark:text-neutral-200">
          <span className="truncate text-base leading-normal">
            {renderWithEmoji(status.account.emojis, status.account.displayName)}
          </span>
          <span className="truncate text-xs leading-normal">
            {status.account.acct}
          </span>
        </div>

        <div className="flex-1 flex-shrink"></div>

        <div className="self-start">
          <relative-time
            // @ts-expect-error - relative-time-element is not typed properly
            class="text-xs leading-normal dark:text-neutral-400"
            datetime={status.createdAt}
            tense="past"
            format="relative"
            formatStyle="narrow"
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
        <div className="text-sm dark:text-neutral-100">
          {parse(status.content, parseOptions)}
        </div>
      )) ||
        null}
      {(mediaRenders.length && (
        <div
          className="relative mt-4 mb-2 flex gap-1"
          {...buttonProps}
          ref={mediaWrapperRef}
        >
          <SmallButton
            variant="monochrome"
            className={clsx(
              "absolute",
              (areMediaHidden || hasUncachedMedia) &&
                "top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2",
              !areMediaHidden && !hasUncachedMedia && "top-1 left-1 z-20"
            )}
            onPress={() => {
              if (hasUncachedMedia) {
                return;
              }
              setAreMediaHidden((p) => !p);
            }}
          >
            {renderMediaText()}
          </SmallButton>
          {mediaRenders}
        </div>
      )) ||
        null}
    </article>
  );
}
