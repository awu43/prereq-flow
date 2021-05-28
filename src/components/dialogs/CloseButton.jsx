import React from "react";
import PropTypes from "prop-types";

import "./CloseButton.scss";

export default function CloseButton({ btnRef, onClick, disabled }) {
  return (
    <button
      ref={btnRef}
      type="button"
      className="CloseButton"
      onClick={onClick}
      disabled={disabled}
    >
      <img src="dist/icons/x-black.svg" alt="close" />
    </button>
  );
}
CloseButton.defaultProps = {
  btnRef: null,
  disabled: false,
};
CloseButton.propTypes = {
  btnRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  }),
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
