import type { RefObject } from "react";

import xBlackIcon from "@icons/x-black.svg";

import "./CloseButton.scss";

interface CloseButtonProps {
  btnRef?: RefObject<HTMLButtonElement> | null;
  onClick: () => void;
  disabled?: boolean;
}
export default function CloseButton({
  btnRef = null,
  onClick,
  disabled = false,
}: CloseButtonProps): JSX.Element {
  return (
    <button
      ref={btnRef}
      type="button"
      className="CloseButton"
      onClick={onClick}
      disabled={disabled}
    >
      <img src={xBlackIcon} alt="Close" />
    </button>
  );
}
