import React, { useState, useMemo } from "react";

import type { FlowElement } from "react-flow-renderer";

import type {
  ModalClass,
  CloseModal,
  CourseNode,
  Element,
} from "types/main";

import "./TableDialog.scss";
import ModalDialog from "./ModalDialog";
import {
  courseIdMatch,
  newNodeData,
  filterUnconditionalElements,
} from "../../utils";

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

  const [tableData, tableNodes] = useMemo(() => {
    const elems = filterUnconditionalElements(elements);
    const data = newNodeData(elems);
    const nodes = elems.slice(0, data.size) as CourseNode[];
    return [data, nodes];
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
    case "name":
      tableNodes.sort((a, b) => a.data.name.localeCompare(b.data.name));
      break;
    default:
      break;
  }

  const tableRows = tableNodes.map(node => {
    const nodeData = tableData.get(node.id);
    let { prerequisite } = node.data;
    for (const match of courseIdMatch(prerequisite) ?? []) {
      prerequisite = prerequisite.replace(
        match, match.replaceAll(" ", "\u00A0")
      );
    }
    return (
      <tr key={node.id}>
        <td>{nodeData.depth}</td>
        <td>{node.id}</td>
        <td>{node.data.name.replace(/ (\S+?)$/, "\u00A0$1")}</td>
        <td>{prerequisite}</td>
        <td>
          <ul>
            {nodeData.incomingNodes.map(n => <li key={n}>{n}</li>)}
          </ul>
        </td>
        <td>
          <ul>
            {nodeData.outgoingNodes.map(n => <li key={n}>{n}</li>)}
          </ul>
        </td>
        <td>
          <button
            type="button"
            className="TableDialog__delete-btn"
            onClick={() => {
              setBusy(true);
              onElementsRemove([node]);
              setBusy(false);
            }}
          >
            <img src="dist/icons/trash.svg" alt="Trash can" />
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
