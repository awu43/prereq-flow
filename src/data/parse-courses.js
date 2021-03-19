import courseData from "./course-data.js";

export const ZERO_POSITION = { x: 0, y: 0 };
const CRS = String.raw`(?:[A-Z]+ )+\d{3}`; // COURSE_REGEX_STRING
const COURSE_REGEX = new RegExp(CRS, "g");

function newNode(course) {
  return {
    id: course,
    position: ZERO_POSITION,
    data: { label: course },
    className: "over-one-away",
  };
}

function newEdge(source, target, id = null) {
  const edgeId = id ?? `${source} -> ${target}`;
  return {
    id: edgeId,
    source,
    target,
    className: "over-one-away",
  };
}

// eslint-disable-next-line import/no-mutable-exports
export let elements = Object.keys(courseData).map(c => newNode(c));
const elementIds = new Set(Object.keys(courseData));
const secondPass = new Map();

function addEdges(sources, target) {
  for (const source of sources) {
    elements.push(newEdge(source, target));
    if (!elementIds.has(source)) {
      elements.push(newNode(source));
      elementIds.add(source);
    }
  }
}

// First pass: unambiguous prerequisites
for (const [course, data] of Object.entries(courseData)) {
  const { prereqText } = data;
  if (!prereqText.match(COURSE_REGEX)) { // No prerequisites
    // eslint-disable-next-line no-continue
    continue;
  }

  const reqSections = prereqText.split(";");
  for (const section of reqSections) {
    const courseMatches = section.match(COURSE_REGEX);
    if (courseMatches.length === 1) {
      addEdges(courseMatches, course);
    } else {
      if (!secondPass.has(course)) {
        secondPass.set(course, []);
      }
      secondPass.get(course).push(section);
    }
  }
}

const DOUBLE_EITHER_REGEX = new RegExp(`(?:[Ee]ither )?(${CRS}) or (${CRS})`);
// "AAA 000 or AAA 111"
const TRIPLE_EITHER_REGEX = new RegExp(
  `(?:[Ee]ither )?(${CRS}), (${CRS}),? or (${CRS})`
);
// "AAA 000, AAA 111, or AAA 222"

// TODO: E E 215 "a or (b and (c or d))"
// TODO: MATH 309 "(a and b) or c"
// State machine maybe (look into JSON parsing)
// TODO: Concurrency

// Second pass: single "or" prerequisites
for (const [course, problemSection] of secondPass.entries()) {
  for (const section of problemSection) {
    const doubleEitherMatch = section.match(DOUBLE_EITHER_REGEX);
    const tripleEitherMatch = section.match(TRIPLE_EITHER_REGEX);
    const matches = tripleEitherMatch || doubleEitherMatch;
    // Double can match triple but not the other way around
    if (matches
        && matches.length === section.match(COURSE_REGEX).length + 1) {
      // If not all courses captured (i.e. 3+), it's a false match
      const alreadyRequired = matches.slice(1).find(m => elementIds.has(m));
      if (alreadyRequired) {
        // One of the choices is already required, so go with that one
        // TODO: implement OR into react flow instead of just picking one
        addEdges([alreadyRequired], course);
      } else {
        // TODO: Add every last one of them
      }
    } else {
      // TODO: Add every last one of them
    }
  }
}

// DEMO FIXES (REMOVE LATER)
addEdges(["MATH 307", "MATH 308"], "MATH 309");
addEdges(["MATH 125", "MATH 307"], "E E 215");
const concurrentEdges = [
  "MATH 124 -> PHYS 121",
  "MATH 125 -> PHYS 122",
  "MATH 126 -> PHYS 123",
  "MATH 307 -> E E 215",
  "MATH 390 -> M E 395",
];
elements = elements.map(elem => (
  concurrentEdges.includes(elem.id)
    ? {
      ...elem,
      label: "CC",
      labelBgPadding: [2, 2],
      labelBgBorderRadius: 4,
    }
    : elem
));
// DEMO FIXES (REMOVE LATER)

export const _testing = {
  COURSE_REGEX,
  DOUBLE_EITHER_REGEX,
  TRIPLE_EITHER_REGEX,
};
