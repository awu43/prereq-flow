import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { NodeId, CourseData, NodeDataMap } from "types/main";
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
}: EditDataDialogProps): JSX.Element {
  const [busy, setBusy] = useState(false);
  const [courseData, setCourseData] = useState<CourseData>({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

  useEffect(() => {
    setCourseData(originalData);
  }, [originalData]);

  const courseIdRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (modalCls === "") {
      setTimeout(() => {
        textAreaRef.current?.setSelectionRange(
          courseData.description.length,
          courseData.description.length,
        );
        courseIdRef.current?.focus();
      });
      // Delay until next cycle in case user prefers reduced motion
      // so course data will be set
    }
  }, [modalCls]);

  const prefersReducedMotion = usePrefersReducedMotion();
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

  // TODO: Option to update ID references
  function save(): void {
    setBusy(true);
    saveCourseData(originalData.id, courseData);
    close();
  }

  function onChangeFn(
    key: keyof CourseData,
  ): (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
    return e => setCourseData(prev => ({ ...prev, [key]: e.target.value }));
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
              nodeData.has(courseData.id) &&
              courseData.id !== originalData.id &&
              !modalCls.includes("--transparent") &&
              !modalCls.includes("--display-none")
            }
          >
            <input
              disabled={busy}
              className="EditDataForm__id-input"
              type="text"
              ref={courseIdRef}
              required={true}
              placeholder="Course ID (required)"
              value={courseData.id}
              onChange={onChangeFn("id")}
            />
          </Tippy>
          <input
            disabled={busy}
            className="EditDataForm__name-input"
            type="text"
            placeholder="Course name"
            value={courseData.name}
            onChange={onChangeFn("name")}
          />
          <input
            disabled={busy}
            className="EditDataForm__credits-input"
            type="text"
            placeholder="Credits"
            value={courseData.credits}
            onChange={onChangeFn("credits")}
          />
        </div>
        <textarea
          ref={textAreaRef}
          disabled={busy}
          className="EditDataForm__description-input"
          placeholder="Description"
          value={courseData.description}
          onChange={onChangeFn("description")}
        ></textarea>
        <div className="EditDataForm__footer-row">
          <input
            disabled={busy}
            className="EditDataForm__prerequisite-input"
            type="text"
            placeholder="Prerequisite"
            value={courseData.prerequisite}
            onChange={onChangeFn("prerequisite")}
          />
          <input
            disabled={busy}
            className="EditDataForm__offered-input"
            type="text"
            placeholder="Offered"
            value={courseData.offered}
            onChange={onChangeFn("offered")}
          />
        </div>
        <button
          type="button"
          className="EditDataForm__add-button"
          onClick={save}
          disabled={
            !courseData.id.trim() ||
            (nodeData.has(courseData.id) &&
              courseData.id !== originalData.id) ||
            busy
          }
        >
          Save
        </button>
      </form>
    </ModalDialog>
  );
}
