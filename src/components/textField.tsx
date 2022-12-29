import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useRef } from "react";
import type { AriaTextFieldOptions } from "react-aria";
import { useTextField } from "react-aria";

interface TextFieldProps extends AriaTextFieldOptions<"input"> {
  className?: string;
}

export function TextInput(props: PropsWithChildren<TextFieldProps>) {
  const { label } = props;
  const ref = useRef<HTMLInputElement>(null);

  const { labelProps, inputProps } = useTextField(props, ref);

  return (
    <div className={props.className}>
      <label {...labelProps} className="prose dark:prose-invert">
        {label}
      </label>
      <input
        {...inputProps}
        ref={ref}
        className={clsx(
          "rounded-md bg-neutral-200 px-2 py-1 text-base dark:bg-neutral-700",
          "border-2 border-transparent outline-none",
          "focus:border-2 focus:border-violet-500",
          inputProps.disabled && "opacity-50"
        )}
      />
      {/* {props.errorMessage && props.validationState === "invalid" && (
        <div {...errorMessageProps} style={{ color: "red", fontSize: 12 }}>
          {props.errorMessage}
        </div>
      )} */}
      {props.children}
    </div>
  );
}
