import { createElement, type ReactElement } from "react";

import { App } from "./App";

export function bootstrap(): ReactElement {
  return createElement(App);
}
