import clsx from "clsx";
import type { PropsWithHtmlProps } from "../helpers/typeHelpers";

export function Block(props: PropsWithHtmlProps<"div">) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        className,
        "my-10 mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-lg bg-white p-4 shadow-xl"
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
