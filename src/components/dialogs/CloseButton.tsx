import React from "react";
import type { RefObject } from "react";

import "./CloseButton.scss";

interface CloseButtonProps {
  btnRef: RefObject<HTMLButtonElement> | null;
  onClick: () => void;
  disabled: boolean;
}
export default function CloseButton({
  btnRef = null,
  onClick,
  disabled = false,
}: CloseButtonProps) {
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
