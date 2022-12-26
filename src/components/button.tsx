import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useRef } from "react";
import type { AriaButtonProps } from "react-aria";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { useButton } from "react-aria";

export function Button(props: PropsWithChildren<AriaButtonProps<"button">>) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { children, ...ariaProps } = props;
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocused } = useFocusRing(ariaProps);
  const { isHovered, hoverProps } = useHover(ariaProps);
  const mergedProps = mergeProps(buttonProps, hoverProps);
  const { disabled } = mergedProps;

  return (
    <button
      {...mergedProps}
      ref={ref}
      className={clsx(
        "inline-block rounded-md px-4 py-2 text-white shadow-lg shadow-violet-500/30",
        isPressed
          ? "bg-violet-800 ring-2 ring-violet-800 ring-offset-2"
          : "bg-violet-500",
        isHovered && "bg-violet-600 shadow-violet-600/30",
        isFocused && "ring-2 ring-violet-600 ring-offset-2",
        "outline-none",
        "transition-colors duration-200 ease-in-out",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  );
}
