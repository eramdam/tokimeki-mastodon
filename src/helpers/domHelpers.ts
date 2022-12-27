import { isElement as lodashIsElement } from "lodash-es";

export function isElement(node: EventTarget | null): node is Element {
  return lodashIsElement(node);
}
