import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useRef } from "react";
import type { AriaButtonProps, AriaRadioGroupProps } from "react-aria";
import { useRadio, useRadioGroup } from "react-aria";
import type { RadioGroupState } from "react-stately";
import { useRadioGroupState } from "react-stately";

const RadioContext = createContext<RadioGroupState | null>(null);

export function RadioGroup(
  props: PropsWithChildren<AriaRadioGroupProps & { className?: string }>
) {
  const { label, children } = props;
  const state = useRadioGroupState(props);
  const { labelProps, radioGroupProps } = useRadioGroup(props, state);

  return (
    <div
      {...radioGroupProps}
      className={clsx("flex flex-col", props.className)}
    >
      <span {...labelProps}>{label}</span>
      <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
    </div>
  );
}

export function Radio(props: AriaButtonProps<"input"> & { value: string }) {
  const { children } = props;
  const state = useContext(RadioContext);
  const ref = useRef(null);
  const { inputProps } = useRadio(props, state as RadioGroupState, ref);

  return (
    <label>
      <input type="checkbox" {...inputProps} ref={ref} /> {children}
    </label>
  );
}
