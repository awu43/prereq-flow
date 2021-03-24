import React from "react";
import PropTypes from "prop-types";

import ModalDialog from "./ModalDialog.jsx";

export default function AboutDialog({ modalCls, closeDialog }) {
  function close() {
    closeDialog();
  }

  return (
    <ModalDialog modalCls={modalCls} dlgCls="AboutDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button type="button" className="close-button" onClick={close}></button>
      <section className="AboutDialog__about-section">
        <h2>About</h2>
        <p>Prereq Flow is an unofficial course planning aid for University of Washington students that visualizes courses and prerequisites in undergraduate degrees.</p>
        <p>
          <a
            href="https://github.com/andrew-1135/prereq-flow"
            target="_blank"
            rel="noreferrer"
            className="AboutDialog__github-link"
          >
            <img src="dist/github.svg" alt="Github logo" />
            Source code
          </a>
        </p>
      </section>
      <section className="AboutDialog__contact-section">
        <h2>Contact</h2>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" />
        <label htmlFor="email">Email</label>
        <input type="email" name="email" />
        <label htmlFor="Message">Message</label>
        <textarea name="message" rows="5"></textarea>
        <button type="submit">Submit</button>
      </section>
    </ModalDialog>
  );
}
AboutDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
};
