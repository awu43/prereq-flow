import React from "react";
import type { KeyboardEvent } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import "./AboutDialog.scss";

import CloseButton from "./CloseButton";
import type { ModalClass, CloseModal } from "../../../types/main";

interface AboutDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
}
export default function AboutDialog({
  modalCls,
  closeDialog,
}: AboutDialogProps) {
  // const [msgName, setMsgName] = useState("");
  // const [msgEmail, setMsgEmail] = useState("");
  // const [msgContent, setMsgContent] = useState("");

  function close() {
    closeDialog();
  }

  // function submitMessage() {

  // }

  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      onDismiss={event => {
        if ((event as KeyboardEvent).key === "Escape") {
          closeDialog();
        }
      }}
    >
      <DialogContent className="AboutDialog" aria-label="About dialog">
        <CloseButton onClick={close} />
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
        {/* TODO: Contact backend */}
        {/* TODO: Honeypot/catchpha */}
        {/* <form className="AboutDialog__contact-form">
        <h2>Contact</h2>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={msgName}
          onChange={e => setMsgName(e.target.value)}
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          value={msgEmail}
          onChange={e => setMsgEmail(e.target.value)}
        />
        <label htmlFor="Message">Message</label>
        <textarea
          name="message"
          rows="5"
          value={msgContent}
          onChange={e => setMsgContent(e.target.value)}
        >
        </textarea>
        <button type="submit" onClick={submitMessage}>Submit</button>
      </form> */}
      </DialogContent>
    </DialogOverlay>
  );
}
