import type { JSX, PropsWithChildren } from "react";

export type PropsWithHtmlProps<
  E extends keyof JSX.IntrinsicElements,
  P = PropsWithChildren<object>,
> = Omit<JSX.IntrinsicElements[E], keyof P> & P;
