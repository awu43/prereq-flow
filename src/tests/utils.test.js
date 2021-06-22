/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-undef */
import fs from "fs";
import path from "path";

import { expect } from "chai";

import { TEST_COND_IDS } from "./test-utils";

import { edgeArrowId, isEdge, _testing } from "../utils";

const testElements = JSON.parse(
  fs.readFileSync(path.join(__dirname, "test-flow.json"))
).elements;
function newTestElems() {
  return JSON.parse(JSON.stringify(testElements));
}

const testCourseData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "test-course-data.json"))
);
function getCourseData(courseIds) {
  return testCourseData.filter(cd => courseIds.includes(cd.id));
}

const {
  courseIdMatch,
  eitherOrMatches,
  CONCURRENT_REGEX,
  isRestriction,
  generateInitialElements,
  newNodeData,
  sortElementsByDepth,
  newElemIndexes,
  setNodeStatus,
  updateNodeStatus,
  updateAllNodes,
  nodeSpacing,
  filterUnconditionalElements,
  getSourcePositions,
  newPosition,
  averagePosition,
  averageYPosition,
  autoconnect,
} = _testing;

describe("courseIdMatches", () => {
  it("Matches 'MATH 125'", () => {
    expect(courseIdMatch("MATH 125")).to.eql(["MATH 125"]);
  });
  it("Matches 'A A 210'", () => {
    expect(courseIdMatch("A A 210")).to.eql(["A A 210"]);
  });
  it("Matches 'CS&SS 221'", () => {
    expect(courseIdMatch("CS&SS 221")).to.eql(["CS&SS 221"]);
  });
  it("Matches 'either STAT 340, or STAT 395/MATH 395'", () => {
    expect(courseIdMatch("either STAT 340, or STAT 395/MATH 395"))
      .to.eql(["STAT 340", "STAT 395", "MATH 395"]);
  });
  it("Does not match 'None'", () => {
    expect(courseIdMatch("None")).to.be.null;
  });
});

describe("eitherOrMatches", () => {
  it("Matches 2 course options with leading either", () => {
    const match = eitherOrMatches("Either MATH 125 or MATH 134");
    expect(match).to.eql(["MATH 125", "MATH 134"]);
  });
  it("Matches 2 course options without leading either", () => {
    const match = eitherOrMatches("MATH 126 or MATH 136.");
    expect(match).to.eql(["MATH 126", "MATH 136"]);
  });
  it("Matches 3 course options", () => {
    const match = eitherOrMatches(
      "Either MATH 125, Q SCI 292, or MATH 135"
    );
    expect(match).to.eql(["MATH 125", "Q SCI 292", "MATH 135"]);
  });
  it("Matches 5 course options", () => {
    const match = eitherOrMatches(
      "and either STAT 311, STAT 390, STAT 391, IND E 315, or Q SCI 381."
    );
    const expected = [
      "STAT 311", "STAT 390", "STAT 391", "IND E 315", "Q SCI 381"
    ];
    expect(match).to.eql(expected);
  });
  it("Returns null on course count mismatch", () => {
    const match = eitherOrMatches("either STAT 340, or STAT 395/MATH 395");
    expect(match).to.be.null;
  });
});

describe("CONCURRENT_REGEX", () => {
  it("Tests true for a single course", () => {
    expect(CONCURRENT_REGEX.test("IND E 311, which may be taken concurrently"))
      .to.be.true;
  });
  it("Tests true for 2 course options", () => {
    const test = CONCURRENT_REGEX.test(
      "Either MATH 124 or MATH 134, which may be taken concurrently."
    );
    expect(test).to.be.true;
  });
  it("Tests true for 2 course options with trailing instructor", () => {
    const test = CONCURRENT_REGEX.test(
      "IND E 315 or MATH 390 either of which may be taken concurrently. Instructors: Cooper"
    );
    expect(test).to.be.true;
  });
});

describe("isRestriction", () => {
  it("Matches 'Cannot be taken for credit'", () => {
    // CSS 551
    const section = "Cannot be taken for credit if CSS 451 already taken";
    expect(isRestriction(section)).to.be.true;
  });
  it("Matches 'cannot be taken for credit", () => {
    // POL S 312
    const section = "cannot be taken for credit if POL S 318 or POL S 319 already taken.";
    expect(isRestriction(section)).to.be.true;
  });
  it("Matches 'Not open for credit'", () => {
    // BIS 349
    const section = "Not open for credit to students who have taken PSYCH 203 or PSYCH 303 at the Seattle Campus.";
    expect(isRestriction(section)).to.be.true;
  });
  it("Matches 'may not be taken for credit'", () => {
    // BIOL 360
    const section = "may not be taken for credit if credit earned in BIOL 403";
    expect(isRestriction(section)).to.be.true;
  });
  it("Matches 'may not be taken'", () => {
    // ENGL 131
    const section = "may not be taken if a minimum grade of 2.0 received in either ENGL 111, ENGL 121, or ENGL 131.";
    expect(isRestriction(section)).to.be.true;
  });
});

describe("generateInitialElements", () => {
  it("Creates a single connection", () => {
    const courseData = getCourseData(["MATH 125", "MATH 126"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const elemIndexes = newElemIndexes(initialElements);
    expect(elemIndexes.has("MATH 125 -> MATH 126")).to.be.true;
  });
  it("Creates a single concurrent connection", () => {
    const courseData = getCourseData(["PHYS 114", "PHYS 117"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const elemIndexes = newElemIndexes(initialElements);
    const concurrentEdge = (
      initialElements[elemIndexes.get("PHYS 114 -> PHYS 117")]
    );
    expect(concurrentEdge.data.concurrent).to.be.true;
  });
  it("Does not create a connection for a restriction", () => {
    const courseData = getCourseData(["ACCTG 225", "ACCTG 219"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const elemIndexes = newElemIndexes(initialElements);
    expect(elemIndexes.has("ACCTG 225 -> ACCTG 219")).to.be.false;
  });
  it("Generates an OR node for either/or prereqs", () => {
    const courseData = getCourseData(["MATH 307", "AMATH 351", "AMATH 353"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(initialElements);
    const elemIndexes = newElemIndexes(initialElements);
    expect(nodeData.get("AMATH 353").incomingNodes).to.have.lengthOf(1);
    const [orId] = nodeData.get("AMATH 353").incomingNodes;
    const orNode = initialElements[elemIndexes.get(orId)];
    expect(orNode.type).to.equal("or");
    expect(elemIndexes.has(`MATH 307 -> ${orId}`)).to.be.true;
    expect(elemIndexes.has(`AMATH 351 -> ${orId}`)).to.be.true;
  });
  it("Generates an OR node and concurrent connections", () => {
    const courseData = getCourseData(["MATH 124", "MATH 134", "PHYS 121"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(initialElements);
    const [orId] = nodeData.get("PHYS 121").incomingNodes;
    const elemIndexes = newElemIndexes(initialElements);
    const concurrentEdge1 = (
      initialElements[elemIndexes.get(edgeArrowId("MATH 124", orId))]
    );
    const concurrentEdge2 = (
      initialElements[elemIndexes.get(edgeArrowId("MATH 134", orId))]
    );
    expect(concurrentEdge1.data.concurrent).to.be.true;
    expect(concurrentEdge2.data.concurrent).to.be.true;
  });
  it("Does not an generate OR node for a restriction", () => {
    const courseData = getCourseData(["POL S 318", "POL S 319", "POL S 312"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(initialElements);
    expect(nodeData.get("POL S 318").outgoingNodes).to.be.empty;
    expect(nodeData.get("POL S 319").outgoingNodes).to.be.empty;
    expect(nodeData.get("POL S 312").incomingNodes).to.be.empty;
  });
  it("Aggressively makes connections when parsing fails", () => {
    const courseData = getCourseData([
      "MATH 126", "MATH 307", "AMATH 351", "E E 215"
    ]);
    const initialElements = generateInitialElements(courseData, "aggressively");
    const nodeData = newNodeData(initialElements);
    expect(nodeData.get("E E 215").incomingEdges).to.have.lengthOf(3);
  });
});

describe("newNodeData", () => {
  it("Generates new node data", () => {
    const nodeData = newNodeData(testElements);
    const math126 = nodeData.get("MATH 126");
    expect(math126.depth).to.equal(1);
    expect(math126.incomingNodes).to.eql(["MATH 125"]);
    expect(math126.incomingEdges).to.eql(["MATH 125 -> MATH 126"]);
    expect(math126.outgoingEdges).to.eql(["MATH 126 -> MATH 308"]);
    expect(math126.outgoingNodes).to.eql(["MATH 308"]);
  });
});

describe("sortElementsByDepth", () => {
  it("Sorts elements by depth", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);

    let lastDepth = 0;
    for (let i = 0; i < nodeData.size; i++) {
      const nodeDepth = nodeData.get(elements[i].id).depth;
      expect(nodeDepth).to.be.at.least(lastDepth);
      lastDepth = nodeDepth;
    }
    for (let i = nodeData.size; i < elements.length; i++) {
      expect(isEdge(elements[i])).to.be.true;
    }
  });
});

describe("setNodeStatus", () => {
  it("Sets a node's status", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);
    setNodeStatus(
      "MATH 125", "enrolled", elements, nodeData, elemIndexes
    );

    expect(elements[elemIndexes.get("MATH 125")].data.nodeStatus)
      .to.equal("enrolled");
    for (const edgeId of nodeData.get("MATH 125").outgoingEdges) {
      expect(elements[elemIndexes.get(edgeId)].className)
        .to.equal("enrolled");
    }
  });
});

describe("updateNodeStatus", () => {
  it("Updates a course node's status", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);
    setNodeStatus(
      "MATH 125", "completed", elements, nodeData, elemIndexes
    );
    updateNodeStatus("MATH 126", elements, nodeData, elemIndexes);
    expect(elements[elemIndexes.get("MATH 126")].data.nodeStatus)
      .to.equal("ready");
  });
  it("Updates an OR node's status", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);
    setNodeStatus(
      "MATH 125", "completed", elements, nodeData, elemIndexes
    );
    const orNodeId = TEST_COND_IDS.OR1;
    updateNodeStatus(orNodeId, elements, nodeData, elemIndexes);
    expect(elements[elemIndexes.get(orNodeId)].data.nodeStatus)
      .to.equal("completed");
  });
  it("Updates an AND node's status", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);
    setNodeStatus(
      "MATH 307", "completed", elements, nodeData, elemIndexes
    );
    setNodeStatus(
      "MATH 308", "enrolled", elements, nodeData, elemIndexes
    );
    const andNodeId = "AND-SZ7MzhC510siGlVNEg0Qm";
    updateNodeStatus(andNodeId, elements, nodeData, elemIndexes);
    expect(elements[elemIndexes.get(andNodeId)].data.nodeStatus)
      .to.equal("enrolled");
  });
});

describe("updateAllNodes", () => {
  it("Updates all node statuses", () => {
    const nodeData = newNodeData(testElements);
    let elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);
    setNodeStatus(
      "MATH 125", "completed", elements, nodeData, elemIndexes
    );
    setNodeStatus(
      "MATH 135", "completed", elements, nodeData, elemIndexes
    );
    elements = updateAllNodes(elements, nodeData, elemIndexes);

    expect(elements[elemIndexes.get("MATH 307")].data.nodeStatus)
      .to.equal("ready");
    expect(elements[elemIndexes.get("AMATH 301")].data.nodeStatus)
      .to.equal("ready");
    expect(elements[elemIndexes.get("MATH 308")].data.nodeStatus)
      .to.equal("one-away");
  });
});

describe("filterConditionalNodes", () => {
  it("Reroutes all conditional nodes", () => {
    const filteredElems = filterUnconditionalElements(newTestElems());
    const nodeData = newNodeData(filteredElems);
    expect(nodeData.get("AMATH 301").incomingNodes)
      .to.have.members(["MATH 125", "MATH 135"]);
    expect(nodeData.get("MATH 309").incomingNodes)
      .to.have.members(["MATH 307", "MATH 308", "MATH 136"]);
  });
});

describe("getSourcePositions", () => {
  it("Gets source positions for a course node", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);

    const math309Position = getSourcePositions(
      "MATH 309", elements, elemIndexes, nodeData,
    );
    expect(math309Position)
      .to.eql(elements[elemIndexes.get("MATH 309")].position);
  });
  it("Gets source positions for a conditional node", () => {
    const nodeData = newNodeData(testElements);
    const elements = sortElementsByDepth(newTestElems(), nodeData);
    const elemIndexes = newElemIndexes(elements);

    const conditionalSourcePositions = [getSourcePositions(
      TEST_COND_IDS.OR2, elements, elemIndexes, nodeData,
    )].flat();
    expect(conditionalSourcePositions)
      .to.have.members([
        elements[elemIndexes.get("MATH 307")].position,
        elements[elemIndexes.get("MATH 308")].position,
        elements[elemIndexes.get("MATH 136")].position,
      ].sort());
  });
});

describe("averagePosition", () => {
  it("Returns average position", () => {
    const inputPositions = [newPosition(150, -10), newPosition(-50, 170)];
    expect(averagePosition(inputPositions)).to.eql(newPosition(50, 80));
  });
});

describe("averageYPosition", () => {
  it("Returns average Y position", () => {
    const inputPositions = [newPosition(230, 10), newPosition(0, 30)];
    expect(averageYPosition(inputPositions)).to.equal(20);
  });
});

describe("autoconnect", () => {
  it("Connects to prereqs", () => {
    const courseData = getCourseData([
      "MATH 307", "MATH 308", "MATH 136", "MATH 309"
    ]);
    const elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    const elemIndexes = newElemIndexes(elements);
    const newElements = autoconnect(
      elements[elemIndexes.get("MATH 309")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: true, postreq: false },
      false,
    );
    const newData = newNodeData(newElements);
    expect(newData.get("MATH 309").incomingNodes)
      .to.have.members(["MATH 307", "MATH 308", "MATH 136"]);
  });
  it("Connects to postreqs", () => {
    const courseData = getCourseData([
      "MATH 125", "MATH 307", "AMATH 301", "MATH 126"
    ]);
    const elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    const elemIndexes = newElemIndexes(elements);
    const newElements = autoconnect(
      elements[elemIndexes.get("MATH 125")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: false, postreq: true },
      false,
    );
    const newData = newNodeData(newElements);
    expect(newData.get("MATH 125").outgoingNodes)
      .to.have.members(["MATH 307", "AMATH 301", "MATH 126"]);
  });
  it("Connects to prereqs and postreqs", () => {
    const courseData = getCourseData(["MATH 126", "MATH 308", "MATH 309"]);
    const elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    const elemIndexes = newElemIndexes(elements);
    const newElements = autoconnect(
      elements[elemIndexes.get("MATH 308")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: true, postreq: true },
      false,
    );
    const newData = newNodeData(newElements);
    expect(newData.get("MATH 308").incomingNodes).to.eql(["MATH 126"]);
    expect(newData.get("MATH 308").outgoingNodes).to.eql(["MATH 309"]);
  });
  it("Repositions a node relative to prereqs", () => {
    const courseData = getCourseData([
      "MATH 136", "MATH 307", "MATH 308", "MATH 309"
    ]);
    let elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    elements = sortElementsByDepth(elements, nodeData);
    const elemIndexes = newElemIndexes(elements);
    elements[elemIndexes.get("MATH 307")].position = { x: 0, y: 0 };
    elements[elemIndexes.get("MATH 308")].position = { x: 10, y: 20 };
    elements[elemIndexes.get("MATH 136")].position = { x: 0, y: 100 };
    const newElements = autoconnect(
      elements[elemIndexes.get("MATH 309")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: true, postreq: false },
      true,
    );
    const newIndexes = newElemIndexes(newElements);
    const newPos = newElements[newIndexes.get("MATH 309")].position;
    expect(newPos).to.eql({ x: 10 + nodeSpacing, y: 120 / 3 });
  });
  it("Repositions a node relative to postreqs", () => {
    const courseData = getCourseData([
      "MATH 125", "MATH 307", "AMATH 301", "MATH 126"
    ]);
    let elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    elements = sortElementsByDepth(elements, nodeData);
    elements = elements.slice(0, 4);
    const elemIndexes = newElemIndexes(elements);
    elements[elemIndexes.get("MATH 307")].position = { x: 100, y: -20 };
    elements[elemIndexes.get("AMATH 301")].position = { x: 105, y: 10 };
    elements[elemIndexes.get("MATH 126")].position = { x: 90, y: 160 };
    const newElements = autoconnect(
      elements[elemIndexes.get("MATH 125")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: false, postreq: true },
      true,
    );
    const newIndexes = newElemIndexes(newElements);
    const newPos = newElements[newIndexes.get("MATH 125")].position;
    expect(newPos).to.eql({ x: 90 - nodeSpacing, y: 150 / 3 });
  });
  it("Repositions a node relative to prereqs and postreqs", () => {
    const courseData = getCourseData([
      "PHYS 121", "MATH 126", "M E 323", "M E 395", "M E 333"
    ]);
    let elements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(elements);
    elements = sortElementsByDepth(elements, nodeData);
    elements = elements.slice(0, 5);
    const elemIndexes = newElemIndexes(elements);
    elements[elemIndexes.get("PHYS 121")].position = { x: 15, y: -5 };
    elements[elemIndexes.get("MATH 126")].position = { x: 5, y: 50 };
    elements[elemIndexes.get("M E 395")].position = { x: 110, y: 10 };
    elements[elemIndexes.get("M E 333")].position = { x: 95, y: 65 };
    const newElements = autoconnect(
      elements[elemIndexes.get("M E 323")],
      elements,
      nodeData.size,
      elemIndexes,
      { prereq: true, postreq: true },
      true,
    );
    const newIndexes = newElemIndexes(newElements);
    const newPos = newElements[newIndexes.get("M E 323")].position;
    expect(newPos).to.eql({ x: (15 + 95) / 2, y: 120 / 4 });
  });
});
