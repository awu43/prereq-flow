import { useState } from "react";

import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";

export default function useDialogStatus() {
  const [dialogCls, setDialogCls] = useState("--transparent --display-none");

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
