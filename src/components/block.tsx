import clsx from "clsx";

import type { PropsWithHtmlProps } from "../helpers/typeHelpers";

export function Block(props: PropsWithHtmlProps<"div">) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        "mx-0 w-full gap-2 p-2 first:mt-0 lg:my-10 lg:mx-auto lg:max-w-2xl lg:gap-3 lg:rounded-lg lg:p-4 lg:shadow-xl first:lg:mt-2",
        "bg-white",
        "dark:bg-neutral-800",
        "peer lg:peer-[]:-mt-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
