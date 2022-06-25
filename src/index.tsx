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

// TODO: Mobile/tablet warning
// TODO: Add concurrent edge to legend
// TODO: Dark mode
// TODO: N of prereq (PHYS 321)

// TODO: Context menu for edge style
