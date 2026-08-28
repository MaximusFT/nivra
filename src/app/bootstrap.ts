import { createElement, type ReactElement } from "react";

import { App } from "./App";
import { registerWebMcpTools } from "../webmcp/register";

export function bootstrap(): ReactElement {
  void registerWebMcpTools();
  return createElement(App);
}
