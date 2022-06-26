/* eslint-disable no-undef */
/// <reference types="cypress" />

export function getNode(nodeId) {
  return cy.get(`[data-id="${nodeId}"] > [class*="Node"]`);
}

export function clickContextOption(text) {
  cy.get(".ContextMenu").contains(text).click();
}

export function clickNodeContextOpt(nodeId, optText) {
  getNode(nodeId).rightclick();
  clickContextOption(optText);
}

export function getByTestId(id) {
  return cy.get(`[data-testid="${id}"]`);
}

export function getEdge(src, dest) {
  return getByTestId(`${src} -> ${dest}`);
}

export function deleteNode(nodeId) {
  clickNodeContextOpt(nodeId, "Delete");
}

export function deleteEdge(src, dest) {
  getEdge(src, dest).rightclick({ force: true });
  clickContextOption("Delete");
}
