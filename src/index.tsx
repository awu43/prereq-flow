import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

// TODO: Course add dialog (add connections)
// TODO: Mobile/tablet warning
// TODO: Add concurrent edge to legend
// TODO: Dark mode

// TODO: Context menu for edge style
// TODO: General cycle check on edge update/create
