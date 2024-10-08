import { isString, keyBy } from "lodash-es";
import type { mastodon } from "masto";

export function renderWithEmoji(
  emojiArray: mastodon.v1.CustomEmoji[],
  text: string,
) {
  const emojiMap = keyBy(emojiArray, (e) => e.shortcode);
  const shortcodes = Object.keys(emojiMap).map((s) => `:${s}:`);

  if (emojiArray.length < 1) {
    return isString(text) ? <>{text}</> : text;
  }
  const regex = new RegExp(`(${shortcodes.join("|")})`, "i");
  const textParts = String(text).split(regex);

  if (textParts.length === 1) {
    return isString(text) ? <>{text}</> : text;
  }

  return (
    <>
      {textParts.map((part, index) => {
        if (part.startsWith(":") && part.endsWith(":")) {
          const shortcode = part.slice(1, -1);
          const emoji = emojiMap[shortcode];
          if (!emoji) {
            return part;
          }

          return (
            <img
              key={emoji.shortcode + index}
              src={emoji.url}
              alt={emoji.shortcode}
              className="!m-0 inline h-[1em] w-[1em] align-middle"
            />
          );
        }

        return part;
      })}
    </>
  );
}
