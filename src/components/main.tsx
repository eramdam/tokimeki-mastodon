import clsx from "clsx";
import type { PropsWithHtmlProps } from "../helpers/typeHelpers";

export function Block(props: PropsWithHtmlProps<"div">) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        "my-10 mx-auto max-w-2xl gap-3 rounded-lg bg-white p-4 shadow-xl",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
