import React from "react";
import type { KeyboardEvent } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import type {
  ModalClass,
  CloseModal,
} from "types/main";

interface ModalDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  busy: boolean;
  contentCls: string;
  contentAriaLabel: string;
  children: React.ReactNode
}
export default function ModalDialog(props: ModalDialogProps) {
  const { modalCls, closeDialog, busy, contentCls, contentAriaLabel } = props;
  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
    // Reach UI is not TS friendly here
      onDismiss={event => {
        if ((event as KeyboardEvent).key === "Escape" && !busy) {
          closeDialog();
        }
      }}
    >
      <DialogContent className={contentCls} aria-label={contentAriaLabel}>
        {props.children}
      </DialogContent>
    </DialogOverlay>
  );
}
