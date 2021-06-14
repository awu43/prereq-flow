/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-undef */
import fs from "fs";
import path from "path";

import { expect } from "chai";

import { isEdge, _testing } from "../utils";

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
  generateInitialElements,
  newNodeData,
  sortElementsByDepth,
  newElemIndexes,
  setNodeStatus,
  updateNodeStatus,
  updateAllNodes,
  getSourcePositions,
  newPosition,
  averagePosition,
  averageYPosition,
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

describe("generateInitialElements", () => {
  it("Generates OR nodes for either/or prerequisites", () => {
    const courseData = getCourseData(["MATH 307", "AMATH 351", "AMATH 353"]);
    const initialElements = generateInitialElements(courseData, "cautiously");
    const nodeData = newNodeData(initialElements);
    const elements = sortElementsByDepth(initialElements, nodeData);
    expect(elements[2].type).to.equal("or");
    expect(nodeData.get(elements[2].id).incomingEdges.length).to.equal(2);
    expect(nodeData.get(elements[2].id).outgoingEdges.length).to.equal(1);
  });
  it("Aggressively makes connections when parsing fails", () => {
    const courseData = getCourseData([
      "MATH 126", "MATH 307", "AMATH 351", "E E 215"
    ]);
    const initialElements = generateInitialElements(courseData, "aggressively");
    const nodeData = newNodeData(initialElements);
    expect(nodeData.get("E E 215").incomingEdges.length).to.equal(3);
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
    const orNodeId = "OR-Jg1vC8IVRuKkAivuA3K_O";
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
      "OR-wz5c0miLAHpZGOGGWS8-N", elements, elemIndexes, nodeData,
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
