import React from "react";

import type { ModalClass, CloseModal } from "types/main";

import "./AboutDialog.scss";
import ModalDialog from "./ModalDialog";
import CloseButton from "./CloseButton";

interface AboutDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
}
export default function AboutDialog({
  modalCls,
  closeDialog,
}: AboutDialogProps) {
  return (
    <ModalDialog
      modalCls={modalCls}
      close={closeDialog}
      busy={false}
      contentCls="AboutDialog"
      contentAriaLabel="About dialog"
    >
      <CloseButton onClick={closeDialog} />
      <section className="AboutDialog__about-section">
        <h2>About</h2>
        <p>Prereq Flow is an unofficial course planning aid for University of Washington students that visualizes courses and prerequisites in undergraduate&nbsp;degrees.</p>

        <p>Powered by <a href="https://reactflow.dev/" target="_blank" rel="noreferrer">React Flow</a> in the front and <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noreferrer">FastAPI</a> in the back. Built with <a href="https://www.snowpack.dev/" target="_blank" rel="noreferrer">Snowpack</a> and hosted on&nbsp;<a href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel</a>.</p>

        <p>
          <a
            href="https://github.com/awu43/prereq-flow"
            target="_blank"
            rel="noreferrer"
            className="AboutDialog__github-link"
          >
            <img src="dist/icons/github.svg" alt="Github logo" />
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
          <img src="dist/icons/envelope.svg" alt="Envelope" />
          comments@prereqflow.com
        </a>
      </p>
    </ModalDialog>
  );
}
