/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-undef */
import React from "react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./test.scss";
import App from "../App";

import testFlow from "./test-flow.json";

export function newApp(initialElements = testFlow.elements) {
  return <App initialElements={initialElements} />;
}

export function getNode(nodeId, container) {
  return (
    container.querySelector(`[data-id="${nodeId}"] > .CourseNode`)
  );
}

export function clickContextOption(optName, node, container) {
  userEvent.click(node, { button: 2 });
  const contextOpt = (
    within(container.querySelector(".ContextMenu")).getByText(optName)
  );
  userEvent.click(contextOpt);
}

export function openDialog(openBtnCls, container) {
  userEvent.click(container.querySelector(`.${openBtnCls}`));
}