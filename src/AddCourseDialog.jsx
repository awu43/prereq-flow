import React from "react";
import PropTypes from "prop-types";

import ModalDialog from "./ModalDialog.jsx";

export default function AddCourseDialog({ modalCls, closeDialog }) {
  function close() {
    closeDialog();
  }

  return (
    <ModalDialog modalCls={modalCls} dlgCls="AddCourseDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button type="button" className="close-button" onClick={close}></button>
      <section>
        <h2>Add course</h2>
        <div className="course-search">
          <input type="text" />
          <button type="submit">Add</button>
        </div>
      </section>
    </ModalDialog>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
};
