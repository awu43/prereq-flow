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

// TODO: Header
// TODO: About dialog
// TODO: Degree select dialog
// TODO: Course add dialog

// TODO: Ctrl+Z revert
// TODO: Context menus
// TODO: Connection counters
// TODO: Courses table
// TODO: Alt + Click to advance status
