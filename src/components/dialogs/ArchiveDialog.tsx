import type { CloseModal, ModalClass } from "@useDialogStatus";
import type { useCookies } from "react-cookie";
import ModalDialog from "./ModalDialog";
import "./ArchiveDialog.scss";

interface ArchiveDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  setCookie: ReturnType<typeof useCookies>[1];
}
export default function ArchiveDialog({
  modalCls,
  closeDialog,
  setCookie,
}: ArchiveDialogProps): JSX.Element {
  function close(): void {
    closeDialog();
    setCookie("archive-notice-seen", true, { sameSite: "lax" });
  }

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      busy={false}
      contentCls="ShutdownDialog"
      contentAriaLabel="Shutdown dialog"
    >
      <h2>Archived on December 1, 2023</h2>
      <p>
        You've reached the archived version of Prereq Flow, last updated on
        December 1, 2023. Data for a limited number of majors and courses has
        been kept for demo purposes.
      </p>
    </ModalDialog>
  );
}
