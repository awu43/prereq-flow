import { useState } from "react";

import type { ModalClass, OpenModal, CloseModal } from "types/main";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

export default function useDialogStatus(): [ModalClass, OpenModal, CloseModal] {
  const [
    dialogCls,
    setDialogCls
  ] = useState<ModalClass>("--transparent --display-none");

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
