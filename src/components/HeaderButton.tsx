import React from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import usePrefersReducedMotion from "@usePrefersReducedMotion";

interface HeaderButtonProps {
  label: string;
  description: string;
  onClick: () => void;
}
export default function HeaderButton({
  label,
  description,
  onClick,
}: HeaderButtonProps): JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Tippy
      content={description}
      trigger="mouseenter"
      hideOnClick={true}
      placement="bottom"
      duration={prefersReducedMotion ? 0 : 100}
    >
      <button className="HeaderButton" type="button" onClick={onClick}>
        {label}
      </button>
    </Tippy>
  );
}
