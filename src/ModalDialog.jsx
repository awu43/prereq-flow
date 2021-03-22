import React from "react";
import PropTypes from "prop-types";

export default function ModalDialog(props) {
  if (props.modalCls.includes("--display-none")) {
    return false;
  } else {
    return (
      <div className={props.modalCls}>
        <div className={props.dlgCls}>
          {props.children}
        </div>
      </div>
    );
  }
}
ModalDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  dlgCls: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
