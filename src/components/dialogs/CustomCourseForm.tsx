import React, { useState, useRef } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  SetState,
  CourseData,
  NewCoursePosition,
  NodeDataMap,
} from "types/main";

import "./CustomCourseForm.scss";

interface CustomCourseFormProps {
  busy: boolean;
  setBusy: SetState<boolean>;
  nodeData: NodeDataMap;
  addNewNode: (data: CourseData, position: NewCoursePosition) => void
}
export default function CustomCourseForm({
  busy,
  setBusy,
  nodeData,
  addNewNode,
}: CustomCourseFormProps) {
  const [customCourseData, setCustomCourseData] = useState<CourseData>({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

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

  const customCourseIdRef = useRef<HTMLInputElement>(null);

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
          visible={nodeData.has(customCourseData.id)}
        >
          <input
            disabled={busy}
            ref={customCourseIdRef}
            className="CustomCourseForm__id-input"
            type="text"
            required={true}
            placeholder="Course ID (required)"
            value={customCourseData.id}
            onChange={e => setCustomCourseData({
              ...customCourseData, id: e.target.value
            })}
          />
        </Tippy>
        <input
          disabled={busy}
          className="CustomCourseForm__name-input"
          type="text"
          placeholder="Course name"
          value={customCourseData.name}
          onChange={e => setCustomCourseData({
            ...customCourseData, name: e.target.value
          })}
        />
        <input
          disabled={busy}
          className="CustomCourseForm__credits-input"
          type="text"
          placeholder="Credits"
          value={customCourseData.credits}
          onChange={e => setCustomCourseData({
            ...customCourseData, credits: e.target.value
          })}
        />
      </div>
      <textarea
        disabled={busy}
        className="CustomCourseForm__description-input"
        placeholder="Description"
        value={customCourseData.description}
        onChange={e => setCustomCourseData({
          ...customCourseData, description: e.target.value
        })}
      >
      </textarea>
      <div className="CustomCourseForm__footer-row">
        <input
          disabled={busy}
          className="CustomCourseForm__prerequisite-input"
          type="text"
          placeholder="Prerequisite"
          value={customCourseData.prerequisite}
          onChange={e => setCustomCourseData({
            ...customCourseData, prerequisite: e.target.value
          })}
        />
        <input
          disabled={busy}
          className="CustomCourseForm__offered-input"
          type="text"
          placeholder="Offered"
          value={customCourseData.offered}
          onChange={e => setCustomCourseData({
            ...customCourseData, offered: e.target.value
          })}
        />
      </div>
      <button
        type="button"
        className="CustomCourseForm__add-button"
        onClick={addCustomCourse}
        disabled={
        !customCourseData.id.trim()
        || nodeData.has(customCourseData.id)
        || busy
      }
      >
        Add custom course
      </button>
    </form>
  );
}
