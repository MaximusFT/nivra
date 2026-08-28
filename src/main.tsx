import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { bootstrap } from "./app/bootstrap";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Nivra root element was not found.");
}

createRoot(rootElement).render(<StrictMode>{bootstrap()}</StrictMode>);
