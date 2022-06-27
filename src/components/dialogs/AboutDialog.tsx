import type { ModalClass, CloseModal } from "@useDialogStatus";
import githubIcon from "@icons/github.svg";
import envelopeIcon from "@icons/envelope.svg";

import "./AboutDialog.scss";
import ModalDialog from "./ModalDialog";

interface AboutDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
}
export default function AboutDialog({
  modalCls,
  closeDialog,
}: AboutDialogProps): JSX.Element {
  return (
    <ModalDialog
      modalCls={modalCls}
      close={closeDialog}
      busy={false}
      contentCls="AboutDialog"
      contentAriaLabel="About dialog"
    >
      <section className="AboutDialog__about-section">
        <h2>About</h2>
        <p>
          Prereq Flow is an unofficial course planning aid for University of
          Washington students that visualizes courses and prerequisites in
          undergraduate&nbsp;degrees.
        </p>

        <p>
          Powered by{" "}
          <a href="https://reactflow.dev/" target="_blank" rel="noreferrer">
            React Flow
          </a>{" "}
          in the front and{" "}
          <a
            href="https://fastapi.tiangolo.com/"
            target="_blank"
            rel="noreferrer"
          >
            FastAPI
          </a>{" "}
          in the back. Built with{" "}
          <a href="https://vitejs.dev/" target="_blank" rel="noreferrer">
            Vite
          </a>{" "}
          and hosted on&nbsp;
          <a href="https://vercel.com/" target="_blank" rel="noreferrer">
            Vercel
          </a>
          .
        </p>

        <p>
          <a
            href="https://github.com/awu43/prereq-flow"
            target="_blank"
            rel="noreferrer"
            className="AboutDialog__github-link"
          >
            <img src={githubIcon} alt="" />
            Source code
          </a>
        </p>
      </section>
      <h2>Contact</h2>
      <p>
        <a
          href="mailto:comments@prereqflow.com"
          className="AboutDialog__email-link"
        >
          <img src={envelopeIcon} alt="" />
          comments@prereqflow.com
        </a>
      </p>
    </ModalDialog>
  );
}
