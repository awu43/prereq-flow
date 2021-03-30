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

// TODO: Degree select dialog
// TODO: Course add dialog
// TODO: Mobile/tablet warning
// FIXME: Update node positions with multiclick select

// FIXME: Ctrl+Z undo, Ctrl+Y redo
// TODO: Context menu for edge style
// TODO: Connection counters
// TODO: Courses table
// TODO: Don't select when Alt + Click
