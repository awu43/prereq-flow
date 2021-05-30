import { useState } from "react";

import usePrefersReducedMotion from "./usePrefersReducedMotion";
import type { ModalClass, OpenModal, CloseModal } from "../types/main";

export default function useDialogStatus(): [ModalClass, OpenModal, CloseModal] {
  const [
    dialogCls,
    setDialogCls
  ] = useState<ModalClass>("--transparent --display-none");

  const prefersReducedMotion = usePrefersReducedMotion();

  function openDialog() {
    if (!prefersReducedMotion) {
      setDialogCls("--transparent");
      setTimeout(() => {
        setDialogCls("");
      }, 25);
    } else {
      setDialogCls("");
    }
  }

  function closeDialog() {
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
