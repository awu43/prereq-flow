import React from "react";
import type { KeyboardEvent } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import type { ModalClass } from "types/main";

interface ModalDialogProps {
  modalCls: ModalClass;
  close: () => void;
  busy: boolean;
  contentCls: string;
  contentAriaLabel: string;
  children: React.ReactNode
}
export default function ModalDialog({
  modalCls,
  close,
  busy,
  contentCls,
  contentAriaLabel,
  children,
}: ModalDialogProps) {
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
        {children}
      </DialogContent>
    </DialogOverlay>
  );
}
