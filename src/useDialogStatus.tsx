import { useState } from "react";

import usePrefersReducedMotion from "./usePrefersReducedMotion";

export type ModalClass = "--transparent --display-none" | "--transparent" | "";
export type OpenModal = () => void;
export type CloseModal = () => void;

export default function useDialogStatus(): [ModalClass, OpenModal, CloseModal] {
  const [dialogCls, setDialogCls] = useState<ModalClass>(
    "--transparent --display-none"
  );

  const prefersReducedMotion = usePrefersReducedMotion();

  function openDialog(): void {
    if (!prefersReducedMotion) {
      setDialogCls("--transparent");
      setTimeout(() => {
        setDialogCls("");
      }, 25);
    } else {
      setDialogCls("");
    }
  }

  function closeDialog(): void {
    if (!prefersReducedMotion) {
      setDialogCls("--transparent");
      setTimeout(() => {
        setDialogCls("--transparent --display-none");
      }, 100);
    } else {
      setDialogCls("--transparent --display-none");
    }
  }

  return [dialogCls, openDialog, closeDialog];
}
