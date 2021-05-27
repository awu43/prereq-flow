import React, { useState } from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";

import "./Header.scss";

export default function Header(props) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [pinned, setPinned] = useState(true);

  return (
    <header className={classNames("Header", { "Header--pinned": pinned })}>
      <div className="Header__content">
        <Tippy
          content={pinned ? "Unpin header" : "Pin header"}
          trigger="mouseenter"
          hideOnClick="false"
          placement="right"
          duration={prefersReducedMotion ? 0 : 100}
        >
          <button
            className="Header__pin-button"
            type="button"
            onClick={() => setPinned(!pinned)}
          >
            <img src="dist/icons/triangle.svg" alt="Pin header" />
          </button>
        </Tippy>
        <h1>Prereq Flow</h1>
        <nav className="Header__nav-buttons">
          {props.children}
        </nav>
        <small className="Header__version">
          <small>v</small>{props.version}
        </small>
      </div>
    </header>
  );
}
Header.propTypes = {
  version: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
