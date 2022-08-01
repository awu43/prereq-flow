import { useEffect, useRef } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  SetState,
  CourseData,
  NewCoursePosition,
  NodeDataMap,
} from "types/main";
import { textChangeUpdater } from "@utils";

import "./CustomCourseForm.scss";

interface CustomCourseFormProps {
  tabIndex: number;
  busy: boolean;
  setBusy: SetState<boolean>;
  nodeData: NodeDataMap;
  customCourseData: CourseData;
  setCustomCourseData: SetState<CourseData>;
  addNewNode: (data: CourseData, position: NewCoursePosition) => void;
}
export default function CustomCourseForm({
  tabIndex,
  busy,
  setBusy,
  nodeData,
  customCourseData,
  setCustomCourseData,
  addNewNode,
}: CustomCourseFormProps): JSX.Element {
  const customCourseIdRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (tabIndex === 1) {
      textAreaRef.current?.setSelectionRange(
        customCourseData.description.length,
        customCourseData.description.length,
      );
      customCourseIdRef.current?.focus();
    }
  }, []);

  function resetCustomCourseData(): void {
    setCustomCourseData({
      id: "",
      name: "",
      credits: "",
      description: "",
      prerequisite: "",
      offered: "",
    });
  }

  const onChangeFn = textChangeUpdater(setCustomCourseData);

  function addCustomCourse(): void {
    setBusy(true);
    addNewNode(customCourseData, "zero");
    resetCustomCourseData();
    setBusy(false);
    customCourseIdRef.current?.focus();
  }

  return (
    <form className="CustomCourseForm">
      <div className="CustomCourseForm__header-row">
        <Tippy
          className="tippy-box--error"
          content="Course already exists"
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={tabIndex === 1 && nodeData.has(customCourseData.id)}
        >
          <input
            disabled={busy}
            ref={customCourseIdRef}
            className="CustomCourseForm__id-input"
            type="text"
            required={true}
            placeholder="Course ID (required)"
            value={customCourseData.id}
            onChange={onChangeFn("id")}
          />
        </Tippy>
        <input
          disabled={busy}
          className="CustomCourseForm__name-input"
          type="text"
          placeholder="Course name"
          value={customCourseData.name}
          onChange={onChangeFn("name")}
        />
        <input
          disabled={busy}
          className="CustomCourseForm__credits-input"
          type="text"
          placeholder="Credits"
          value={customCourseData.credits}
          onChange={onChangeFn("credits")}
        />
      </div>
      <textarea
        ref={textAreaRef}
        disabled={busy}
        className="CustomCourseForm__description-input"
        placeholder="Description"
        value={customCourseData.description}
        onChange={onChangeFn("description")}
      ></textarea>
      <div className="CustomCourseForm__footer-row">
        <input
          disabled={busy}
          className="CustomCourseForm__prerequisite-input"
          type="text"
          placeholder="Prerequisite"
          value={customCourseData.prerequisite}
          onChange={onChangeFn("prerequisite")}
        />
        <input
          disabled={busy}
          className="CustomCourseForm__offered-input"
          type="text"
          placeholder="Offered"
          value={customCourseData.offered}
          onChange={onChangeFn("offered")}
        />
      </div>
      <button
        type="button"
        className="CustomCourseForm__add-button"
        onClick={addCustomCourse}
        disabled={
          !customCourseData.id.trim() ||
          nodeData.has(customCourseData.id) ||
          busy
        }
      >
        Add custom course
      </button>
    </form>
  );
}
