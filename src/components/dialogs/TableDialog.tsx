import React, { useState, useMemo } from "react";

import classNames from "classnames";

import type { FlowElement } from "react-flow-renderer";

import timesIcon from "@icons/times.svg";

import type {
  CourseNode,
  Element,
} from "types/main";
import type { ModalClass, CloseModal } from "@useDialogStatus";

import "./TableDialog.scss";
import {
  courseIdMatch,
  newNodeData,
  newElemIndexes,
  filterUnconditionalElements,
} from "@utils";
import ModalDialog from "./ModalDialog";

const COURSE_REGEX = /^(?:[A-Z&]+ )+\d{3}$/;
const COURSE_NUM_REGEX = /\b\d{3}\b/;

interface TableDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  elements: Element[];
  onElementsRemove: (targetElems: FlowElement[]) => void;
}
export default function TableDialog({
  modalCls,
  closeDialog,
  elements,
  onElementsRemove,
}: TableDialogProps) {
  const [busy, setBusy] = useState(false);
  const [sortBy, setSortBy] = useState("id");

  const [tableNodes, tableData] = useMemo(() => {
    const elems = filterUnconditionalElements(elements);
    const data = newNodeData(elems);
    const nodes = elems.slice(0, data.size) as CourseNode[];
    return [nodes, data];
  }, [elements]);

  switch (sortBy) {
    case "depth":
      tableNodes.sort((a, b) => (
        tableData.get(a.id).depth - tableData.get(b.id).depth
      ));
      break;
    case "id":
      tableNodes.sort((a, b) => a.id.localeCompare(b.id));
      break;
    case "id-num":
      tableNodes.sort((a, b) => {
        const aNum = Number(
          (a.id.match(COURSE_NUM_REGEX) ?? ["Infinity"])[0]
        );
        const bNum = Number(
          (b.id.match(COURSE_NUM_REGEX) ?? ["Infinity"])[0]
        );
        return aNum - bNum;
      });
      break;
    case "name":
      tableNodes.sort((a, b) => a.data.name.localeCompare(b.data.name));
      break;
    default:
      break;
  }

  const elemIndexes = newElemIndexes(tableNodes);

  function deleteCourseFunc(node: CourseNode): () => void {
    return () => {
      setBusy(true);
      onElementsRemove([node]);
      setBusy(false);
    };
  }

  function smallDeleteButton(courseId: string): JSX.Element {
    return (
      <button
        type="button"
        className="TableDialog__small-delete-btn"
        onClick={deleteCourseFunc(tableNodes[elemIndexes.get(courseId)])}
      >
        <img src={timesIcon} alt="Delete" />
      </button>
    );
  }

  const tableRows = tableNodes.map(node => {
    const nodeData = tableData.get(node.id);
    let { prerequisite } = node.data;
    for (const match of courseIdMatch(prerequisite) ?? []) {
      const status = (
        tableData.has(match)
          ? tableNodes[elemIndexes.get(match)].data.nodeStatus
          : ""
      );
      prerequisite = prerequisite.replace(
        match, `<span class="course-id ${status}">$&</span>`
      );
    }
    return (
      <tr key={node.id}>
        <td>{nodeData.depth}</td>
        <td
          className={classNames(
            node.data.nodeStatus,
            { "course-id": COURSE_REGEX.test(node.id) }
          )}
        >
          {node.id}
        </td>
        <td>{node.data.name.replace(/ (\S+?)$/, "\u00A0$1")}</td>
        {/* eslint-disable-next-line react/no-danger */}
        <td dangerouslySetInnerHTML={{ __html: prerequisite }} />
        <td>
          <ul>
            {nodeData.incomingNodes.map(n => (
              <li key={n}>
                {smallDeleteButton(n)}
                <span
                  className={tableNodes[elemIndexes.get(n)].data.nodeStatus}
                >
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </td>
        <td>
          <ul>
            {nodeData.outgoingNodes.map(n => (
              <li key={n}>
                {smallDeleteButton(n)}
                <span
                  className={tableNodes[elemIndexes.get(n)].data.nodeStatus}
                >
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </td>
        <td>
          <button
            type="button"
            className="TableDialog__large-delete-btn"
            onClick={deleteCourseFunc(node)}
          >
            <img src={timesIcon} alt="Delete" />
          </button>
        </td>
      </tr>
    );
  });

  return (
    <ModalDialog
      modalCls={modalCls}
      close={closeDialog}
      busy={busy}
      contentCls="TableDialog"
      contentAriaLabel="Table dialog"
    >
      <h2>Courses</h2>
      <fieldset className="SortBy" disabled={busy}>
        Sort by:
        <label className="SortBy__radio-label SortBy__radio-label--depth">
          <input
            type="radio"
            className="SortBy__radio-button"
            name="sort-by"
            checked={sortBy === "depth"}
            onChange={() => setSortBy("depth")}
          />
          Depth
        </label>
        <label className="SortBy__radio-label SortBy__radio-label--id">
          <input
            type="radio"
            className="SortBy__radio-button"
            name="sort-by"
            checked={sortBy === "id"}
            onChange={() => setSortBy("id")}
          />
          ID
        </label>
        <label className="SortBy__radio-label SortBy__radio-label--id-num">
          <input
            type="radio"
            className="SortBy__radio-button"
            name="sort-by"
            checked={sortBy === "id-num"}
            onChange={() => setSortBy("id-num")}
          />
          ID#
        </label>
        <label className="SortBy__radio-label SortBy__radio-label--name">
          <input
            type="radio"
            className="SortBy__radio-button"
            name="sort-by"
            checked={sortBy === "name"}
            onChange={() => setSortBy("name")}
          />
          Name
        </label>
      </fieldset>
      <table className="TableDialog__course-table">
        <thead>
          <tr>
            <th>Depth</th>
            <th>ID</th>
            <th>Name</th>
            <th>Prerequisite</th>
            <th>Incoming</th>
            <th>Outgoing</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    </ModalDialog>
  );
}

export const _testing = { COURSE_NUM_REGEX };
