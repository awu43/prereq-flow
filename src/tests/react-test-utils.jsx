/* eslint-disable import/no-extraneous-dependencies */
import React from "react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "./test.scss";
// eslint-disable-next-line import/no-unresolved
import App from "../App";

import testFlow from "./test-flow.json";

export function newApp(initialElements = testFlow.elements) {
  return <App initialElements={initialElements} />;
}

export function getNode(nodeId, container) {
  return container.querySelector(`[data-id="${nodeId}"] > [class*="Node"]`);
}

export function clickContextOption(optName, target, container) {
  userEvent.click(target, { button: 2 });
  const contextOpt = within(container.querySelector(".ContextMenu")).getByText(
    optName,
  );
  userEvent.click(contextOpt);
}

export function openDialog(openBtnCls, container) {
  userEvent.click(container.querySelector(`.${openBtnCls}`));
}
