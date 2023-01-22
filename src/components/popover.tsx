import type { AriaPopoverProps } from "@react-aria/overlays";
import { DismissButton, Overlay, usePopover } from "@react-aria/overlays";
import clsx from "clsx";
import * as React from "react";
import type { OverlayTriggerState } from "react-stately";

interface PopoverProps extends Omit<AriaPopoverProps, "popoverRef"> {
  children: React.ReactNode;
  state: OverlayTriggerState;
}

export function Popover(props: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { state, children } = props;

  const returnProps = usePopover(
    {
      ...props,
      popoverRef: ref,
    },
    state
  );

  const { popoverProps, underlayProps } = returnProps;

  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={ref}
        className={clsx(
          "z-10 mt-2 rounded-xl border border-violet-300 shadow-lg shadow-black/30",
          "bg-white",
          "dark:bg-neutral-800"
        )}
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
