import type { AriaMenuProps, MenuTriggerProps } from "@react-types/menu";
import type { Node } from "@react-types/shared";
import clsx from "clsx";
import type { CSSProperties } from "react";
import React, { useRef } from "react";
import {
  useMenu,
  useMenuItem,
  useMenuSection,
  useMenuTrigger,
} from "react-aria";
import type { TreeState } from "react-stately";
import { useMenuTriggerState, useTreeState } from "react-stately";

import { useOverlayBugWorkaround } from "../helpers/overlayBugWorkaround";
import { Button } from "./button";
import { Popover } from "./popover";

interface MenuButtonProps<T extends object>
  extends AriaMenuProps<T>,
    MenuTriggerProps {
  label: string;
}

export function MenuButton<T extends object>(props: MenuButtonProps<T>) {
  // Create state based on the incoming props
  const state = useMenuTriggerState(props);
  const menuBugWorkaround = useOverlayBugWorkaround(state);

  // Get props for the menu trigger and menu elements
  const ref = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<T>({}, state, ref);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {menuBugWorkaround}
      <Button
        {...menuTriggerProps}
        isPressed={state.isOpen}
        ref={ref}
        variant="secondary"
      >
        {props.label}
      </Button>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="top">
          <Menu
            {...menuProps}
            {...props}
            autoFocus={state.focusStrategy || true}
            onClose={() => state.close()}
            style={{
              minWidth: ref.current?.clientWidth
                ? ref.current?.clientWidth + 10
                : "",
            }}
          />
        </Popover>
      )}
    </div>
  );
}

interface MenuProps<T extends object> extends AriaMenuProps<T> {
  onClose: () => void;
  style?: CSSProperties;
}

function Menu<T extends object>(props: MenuProps<T>) {
  // Create state based on the incoming props
  const state = useTreeState(props);

  // Get props for the menu element
  const ref = useRef<HTMLUListElement>(null);
  const { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      className="max-w-md focus:outline-none"
      style={props.style}
    >
      {Array.from(state.collection).map((item) => (
        <MenuSection
          key={item.key}
          section={item}
          state={state}
          onAction={props.onAction}
          onClose={props.onClose}
        />
      ))}
    </ul>
  );
}

interface MenuSectionProps<T> {
  section: Node<T>;
  state: TreeState<T>;
  onAction?: (key: React.Key) => void;
  onClose: () => void;
}

function MenuSection<T>({
  section,
  state,
  onAction,
  onClose,
}: MenuSectionProps<T>) {
  const { itemProps, groupProps } = useMenuSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  return (
    <>
      <li
        {...itemProps}
        className={clsx(
          section.key === state.collection.getFirstKey() && "mt-1",
          section.key !== state.collection.getFirstKey() && "mb-1",
        )}
      >
        <ul {...groupProps}>
          {Array.from(section.childNodes).map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state}
              onAction={onAction}
              onClose={onClose}
            />
          ))}
        </ul>
      </li>
    </>
  );
}

interface MenuItemProps<T> {
  item: Node<T>;
  state: TreeState<T>;
  onAction?: (key: React.Key) => void;
  onClose: () => void;
}

function MenuItem<T>({ item, state, onAction, onClose }: MenuItemProps<T>) {
  // Get props for the menu item element
  const ref = React.useRef<HTMLLIElement>(null);
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      onAction,
      onClose,
    },
    state,
    ref,
  );

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  const isFocused = state.selectionManager.focusedKey === item.key;

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={clsx(
        "mx-1 truncate rounded-lg py-2 px-3 text-sm capitalize text-violet-800 focus:outline-none dark:text-violet-500",
        isFocused ? "bg-violet-200 dark:bg-violet-800" : "",
      )}
    >
      {item.rendered}
    </li>
  );
}
