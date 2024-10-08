import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useRef } from "react";
import type { AriaButtonProps } from "react-aria";
import { useButton } from "react-aria";

interface LinkButtonProps extends PropsWithChildren<AriaButtonProps<"button">> {
  className?: string;
  position?: "northwest" | "northeast" | "southwest" | "southeast";
}

export function LinkButton(props: LinkButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(props, ref);

  const positionClassnames: Record<
    NonNullable<LinkButtonProps["position"]>,
    string
  > = {
    northwest: "top-2 left-2",
    northeast: "top-2 right-2",
    southeast: "bottom-2 right-2",
    southwest: "bottom-2 left-2",
  };

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={clsx(
        "text-sm underline dark:text-white",
        props.position && positionClassnames[props.position],
        props.position && "fixed block",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
