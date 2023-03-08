import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { forwardRef } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import type { AriaButtonProps } from "react-aria";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { mergeRefs } from "react-merge-refs";

interface ButtonProps extends AriaButtonProps<"button"> {
  className?: string;
  variant: "primary" | "secondary" | "monochrome";
  isStatic?: boolean;
  isPressed?: boolean;
}

export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>((props, outerRef) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { children, className, isStatic, variant, ...ariaProps } = props;
  const { buttonProps, isPressed: ariaPressed } = useButton(ariaProps, ref);
  const { isFocused } = useFocusRing(ariaProps);
  const { isHovered, hoverProps } = useHover(ariaProps);
  const mergedProps = mergeProps(buttonProps, hoverProps);
  const { disabled } = mergedProps;
  const isPressed = props.isPressed ?? ariaPressed;

  const baseClassname = clsx(
    "inline-block rounded-md px-4 py-2 shadow-lg outline-none text-sm lg:text-base",
    (isHovered || isFocused) && !isStatic && " -translate-y-0.5",
    !isStatic && "transition-all duration-200 ease-in-out",
    disabled && "cursor-not-allowed opacity-40"
  );

  const variantClassnames: Record<ButtonProps["variant"], string> = {
    primary: clsx(
      "text-white shadow-violet-500/30",
      isPressed ? "bg-violet-800  ring-violet-800 " : "bg-violet-500",
      isHovered && "bg-violet-600 shadow-violet-600/30",
      isFocused && "ring-violet-600"
    ),
    secondary: clsx(
      "bg-white dark:bg-neutral-800 dark:text-violet-500 dark:ring-violet-500 text-violet-800 ring-2 ring-inset ring-violet-800",
      (isHovered || isPressed) && "bg-violet-200 dark:bg-violet-800"
    ),
    monochrome: clsx(
      "bg-black/40 text-white backdrop-blur-sm ",
      isHovered && "bg-black/80"
    ),
  };

  // Workaround for react/react-aria #1513
  useEffect(() => {
    ref.current?.addEventListener("touchstart", (event: TouchEvent) => {
      event.preventDefault();
    });
  }, []);

  return (
    <button
      {...mergedProps}
      ref={mergeRefs([ref, outerRef])}
      className={clsx(baseClassname, variantClassnames[variant], className)}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export function SmallButton(props: PropsWithChildren<ButtonProps>) {
  return (
    <Button
      {...props}
      isStatic
      className={clsx("px-2 py-1 text-sm shadow-none", props.className)}
    />
  );
}
