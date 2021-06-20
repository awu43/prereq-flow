import React from "react";
import ReactDOM from "react-dom";

import type { Element } from "types/main";

import "./index.scss";
import App from "./App";

import demoFlow from "./data/demo-flow.json";

ReactDOM.render(
  <React.StrictMode>
    <App initialElements={demoFlow.elements as Element[]} />
  </React.StrictMode>,
  document.getElementById("root"),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

// TODO: Mobile/tablet warning
// TODO: Add concurrent edge to legend
// TODO: Dark mode
// TODO: N of prereq (PHYS 321)

// TODO: Context menu for edge style
