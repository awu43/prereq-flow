import React, { useState, useRef } from "react";

import classNames from "classnames";

import "./UserControls.scss";

export default function UserControls() {
  const [controlsClosed, setControlsClosed] = useState(true);
  const openControlsButtonRef = useRef<HTMLButtonElement>(null);
  // const closeControlsButtonRef = useRef(null);

  return (
    <>
      <button
        ref={openControlsButtonRef}
        type="button"
        className="UserControls__open-btn"
        onClick={() => setControlsClosed(!controlsClosed)}
        // Focusing on close button causes offscreen jerk
      >
        <img src="dist/icons/question.svg" alt="Open controls" />
      </button>
      <aside
        className={classNames(
          "UserControls__content",
          { "UserControls__content--closed": controlsClosed }
        )}
      >
        <ul>
          <li>Click for single&nbsp;select</li>
          <li>Right click for context&nbsp;menus</li>
          <li>Hover over a node for connections and course info (click to hide&nbsp;tooltip)</li>
          <li>Drag to create a new edge from a node when crosshair icon&nbsp;appears</li>
          <li>Drag to reconnect an edge when 4-way arrow icon&nbsp;appears</li>
          <li><kbd>Alt</kbd> + click to advance course&nbsp;status</li>
          <li><kbd>Ctrl</kbd> + click for multiple&nbsp;select</li>
          <li><kbd>Shift</kbd> + drag for area&nbsp;select</li>
          <li><kbd>Del</kbd> to delete selected&nbsp;elements</li>
          <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo (max&nbsp;20)</li>
          <li><kbd>Ctrl</kbd> + <kbd>Y</kbd> to&nbsp;redo</li>
          <button
            // ref={closeControlsButtonRef}
            type="button"
            className="UserControls__close-btn"
            onClick={() => {
              setControlsClosed(true);
              openControlsButtonRef.current?.focus();
            }}
            tabIndex={controlsClosed ? -1 : 0}
          >
            <img src="dist/icons/chevron-right.svg" alt="Close controls" />
          </button>
        </ul>
      </aside>
    </>
  );
}
