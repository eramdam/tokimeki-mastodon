import clsx from "clsx";
import type { PropsWithHtmlProps } from "../helpers/typeHelpers";

export function Block(props: PropsWithHtmlProps<"div">) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        "my-10 mx-auto max-w-2xl gap-3 rounded-lg p-4 shadow-xl",
        "bg-white",
        "dark:bg-neutral-800",
        "peer peer-[]:-mt-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
