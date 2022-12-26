import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useRef } from "react";
import type { AriaButtonProps } from "react-aria";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { useButton } from "react-aria";

interface ButtonProps extends AriaButtonProps<"button"> {
  className?: string;
  variant: "primary" | "secondary";
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { children, className, variant, ...ariaProps } = props;
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocused } = useFocusRing(ariaProps);
  const { isHovered, hoverProps } = useHover(ariaProps);
  const mergedProps = mergeProps(buttonProps, hoverProps);
  const { disabled } = mergedProps;

  const baseClassname = getBaseClassname({
    isPressed,
    isFocused,
    isHovered,
    disabled,
  });

  const variantClassnames: Record<ButtonProps["variant"], string> = {
    primary: clsx(
      "text-white shadow-violet-500/30",
      isPressed ? "bg-violet-800  ring-violet-800 " : "bg-violet-500",
      isHovered && "bg-violet-600 shadow-violet-600/30",
      isFocused && "ring-violet-600"
    ),
    secondary: clsx(
      "bg-white text-violet-800 ring-2 ring-inset ring-violet-800",
      isHovered && "bg-neutral-100"
    ),
  };

  return (
    <button
      {...mergedProps}
      ref={ref}
      className={clsx(baseClassname, variantClassnames[variant], className)}
    >
      {children}
    </button>
  );
}

function getBaseClassname({
  isPressed,
  isFocused,
  isHovered,
  disabled,
}: {
  isPressed?: boolean;
  isFocused?: boolean;
  isHovered?: boolean;
  disabled?: boolean;
}) {
  return clsx(
    "inline-block rounded-md px-4 py-2 shadow-lg outline-none",
    (isPressed || isFocused) && "ring-2 ring-offset-2",
    (isHovered || isFocused) && " -translate-y-0.5",
    "transition-all duration-200 ease-in-out",
    disabled && "cursor-not-allowed opacity-40"
  );
}
