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
    setCookie("archive-notice-seen", true);
  }

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      busy={false}
      contentCls="ShutdownDialog"
      contentAriaLabel="Shutdown dialog"
    >
      <h2>Archiving on December 1, 2023</h2>
      <p>
        Hello there. Since Prereq Flow v1.0.0 went online in July 2021, various
        things have happened in life, and while I've been able to add some
        features since then and update course data every month (give or take), I
        haven't found time to work on or even just maintain the codebase for a
        while now. This doesn't look like it's going to change anytime soon, so
        I have decided to archive Prereq Flow on December 1, 2023. This means
        that the site will be disconnected from databases and UW
        course/curriculum data will no longer be accessible.
      </p>
    </ModalDialog>
  );
}
