import React from "react";
import type { ReactNode, KeyboardEvent, RefObject } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import type { ModalClass } from "@useDialogStatus";

import CloseButton from "./CloseButton";

interface ModalDialogProps {
  modalCls: ModalClass;
  close: () => void;
  closeBtnRef?: RefObject<HTMLButtonElement> | null;
  busy: boolean;
  contentCls: string;
  contentAriaLabel: string;
  children: ReactNode;
}
export default function ModalDialog({
  modalCls,
  close,
  closeBtnRef = null,
  busy,
  contentCls,
  contentAriaLabel,
  children,
}: ModalDialogProps): JSX.Element {
  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      // Reach UI is not TS friendly here
      onDismiss={event => {
        if ((event as KeyboardEvent).key === "Escape" && !busy) {
          close();
        }
      }}
    >
      <DialogContent className={contentCls} aria-label={contentAriaLabel}>
        <CloseButton
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(closeBtnRef ? { btnRef: closeBtnRef } : {})}
          onClick={close}
          disabled={busy}
        />
        {children}
      </DialogContent>
    </DialogOverlay>
  );
}
