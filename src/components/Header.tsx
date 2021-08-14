import React, { useState } from "react";
import type { ReactNode } from "react";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import triangleIcon from "@icons/triangle.svg";

import "./Header.scss";

interface HeaderProps {
  version: string;
  children: ReactNode;
}
export default function Header({
  version,
  children,
}: HeaderProps): JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [pinned, setPinned] = useState(true);

  return (
    <header className={classNames("Header", { "Header--pinned": pinned })}>
      <div className="Header__content">
        <Tippy
          content={pinned ? "Unpin header" : "Pin header"}
          trigger="mouseenter"
          hideOnClick={false}
          placement="right"
          duration={prefersReducedMotion ? 0 : 100}
        >
          <button
            className="Header__pin-button"
            type="button"
            onClick={() => setPinned(!pinned)}
          >
            <img src={triangleIcon} alt="Pin/unpin header" />
          </button>
        </Tippy>
        <h1>Prereq Flow</h1>
        <nav className="Header__nav-buttons">{children}</nav>
        <small className="Header__version">
          {/* eslint-disable-next-line prettier/prettier */}
          <small>v</small>{version}
        </small>
      </div>
    </header>
  );
}
