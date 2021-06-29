import React, { useState, useEffect } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  NodeId,
  CourseData,
  NodeDataMap,
} from "types/main";
import type { ModalClass, CloseModal } from "@useDialogStatus";

import "./EditDataDialog.scss";
import usePrefersReducedMotion from "@usePrefersReducedMotion";
import ModalDialog from "./ModalDialog";

interface EditDataDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  originalData: CourseData;
  nodeData: NodeDataMap;
  saveCourseData: (originalId: NodeId, newData: CourseData) => void;
  resetSelectedElements: () => void;
}
export default function EditDataDialog({
  modalCls,
  closeDialog,
  originalData,
  nodeData,
  saveCourseData,
  resetSelectedElements,
}: EditDataDialogProps) {
  const [busy, setBusy] = useState(false);
  const [courseData, setCourseData] = useState<CourseData>({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setCourseData(originalData);
  }, [originalData]);

  function close(): void {
    resetSelectedElements();
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setBusy(false);
      }, 100);
    } else {
      setBusy(false);
    }
  }

  function save(): void {
    setBusy(true);
    saveCourseData(originalData.id, courseData);
    close();
  }

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      busy={busy}
      contentCls="EditDataDialog"
      contentAriaLabel="Edit course data dialog"
    >
      <h2>Edit course data</h2>
      <form className="EditDataForm">
        <div className="EditDataForm__header-row">
          <Tippy
            className="tippy-box--error"
            content="ID already in use"
            placement="bottom-start"
            arrow={false}
            duration={0}
            offset={[0, 5]}
            visible={
              (
                nodeData.has(courseData.id)
                && courseData.id !== originalData.id
              )
              && (
                !modalCls.includes("--transparent")
                && !modalCls.includes("--display-none")
              )
            }
          >
            <input
              disabled={busy}
              className="EditDataForm__id-input"
              type="text"
              required={true}
              placeholder="Course ID (required)"
              value={courseData.id}
              onChange={e => setCourseData({
                ...courseData, id: e.target.value
              })}
            />
          </Tippy>
          <input
            disabled={busy}
            className="EditDataForm__name-input"
            type="text"
            placeholder="Course name"
            value={courseData.name}
            onChange={e => setCourseData({
              ...courseData, name: e.target.value
            })}
          />
          <input
            disabled={busy}
            className="EditDataForm__credits-input"
            type="text"
            placeholder="Credits"
            value={courseData.credits}
            onChange={e => setCourseData({
              ...courseData, credits: e.target.value
            })}
          />
        </div>
        <textarea
          disabled={busy}
          className="EditDataForm__description-input"
          placeholder="Description"
          value={courseData.description}
          onChange={e => setCourseData({
            ...courseData, description: e.target.value
          })}
        >
        </textarea>
        <div className="EditDataForm__footer-row">
          <input
            disabled={busy}
            className="EditDataForm__prerequisite-input"
            type="text"
            placeholder="Prerequisite"
            value={courseData.prerequisite}
            onChange={e => setCourseData({
              ...courseData, prerequisite: e.target.value
            })}
          />
          <input
            disabled={busy}
            className="EditDataForm__offered-input"
            type="text"
            placeholder="Offered"
            value={courseData.offered}
            onChange={e => setCourseData({
              ...courseData, offered: e.target.value
            })}
          />
        </div>
        <button
          type="button"
          className="EditDataForm__add-button"
          onClick={save}
          disabled={
        !courseData.id.trim()
        || (nodeData.has(courseData.id) && courseData.id !== originalData.id)
        || busy
      }
        >
          Save
        </button>
      </form>
    </ModalDialog>
  );
}
