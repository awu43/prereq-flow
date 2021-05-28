import React from "react";
import PropTypes from "prop-types";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";

export default function HeaderButton({ label, description, onClick }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Tippy
      content={description}
      trigger="mouseenter"
      hideOnClick="true"
      placement="bottom"
      duration={prefersReducedMotion ? 0 : 100}
    >
      <button className="HeaderButton" type="button" onClick={onClick}>
        {label}
      </button>
    </Tippy>
  );
}
HeaderButton.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
