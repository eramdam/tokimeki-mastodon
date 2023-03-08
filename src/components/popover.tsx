import type {
  AriaOverlayProps,
  AriaPopoverProps,
  OverlayTriggerProps,
} from "@react-aria/overlays";
import { useOverlayTrigger } from "@react-aria/overlays";
import { DismissButton, Overlay, usePopover } from "@react-aria/overlays";
import clsx from "clsx";
import * as React from "react";
import { useRef } from "react";
import type { OverlayTriggerState } from "react-stately";
import { useOverlayTriggerState } from "react-stately";

import { useOverlayBugWorkaround } from "../helpers/overlayBugWorkaround";
import { Button } from "./button";

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
          "z-10 mt-2 rounded-xl border-2 border-violet-800 shadow-lg shadow-black/30 dark:border-violet-500",
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

interface PopoverButtonProps extends AriaOverlayProps, OverlayTriggerProps {
  label: string;
  children: React.ReactNode;
}

export function PopoverButton(props: PopoverButtonProps) {
  const state = useOverlayTriggerState(props);
  const menuBugWorkaround = useOverlayBugWorkaround(state);

  const ref = useRef<HTMLButtonElement>(null);
  const { overlayProps, triggerProps } = useOverlayTrigger(props, state, ref);

  return (
    <div>
      {menuBugWorkaround}
      <Button
        {...triggerProps}
        isPressed={state.isOpen}
        ref={ref}
        variant="secondary"
      >
        {props.label}
      </Button>
      {state.isOpen && (
        <Popover
          {...overlayProps}
          state={state}
          triggerRef={ref}
          placement="top"
        >
          {props.children}
        </Popover>
      )}
    </div>
  );
}
