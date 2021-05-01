import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
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

// TODO: Degree select dialog (select courses)
// TODO: Course add dialog (add connections)
// TODO: Mobile/tablet warning
// TODO: Add concurrent edge to legend
// TODO: Add pinned/hidden behavior to legend and header

// TODO: Increase connection point size
// TODO: Context menu for edge style
// TODO: Connection counters
// TODO: Courses table
// TODO: Don't select when Alt + Click
