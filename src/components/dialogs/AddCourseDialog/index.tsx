import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import { ComboboxOption, ComboboxOptionText } from "@reach/combobox";
import type { ComboboxOptionProps } from "@reach/combobox";
import "@reach/combobox/styles.css";

import type {
  CourseData,
  CourseNode,
  Element,
  NodeDataMap,
  ConnectTo,
  NewCoursePosition,
} from "types/main";
import type { ModalClass, CloseModal } from "@useDialogStatus";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import { newCourseNode, generateInitialElements, courseIdMatch } from "@utils";
import "./index.scss";
import FINAL_COURSES from "@data/final_seattle_courses.json";
import ModalDialog from "../ModalDialog";
// import CampusSelect from "../CampusSelect";
import UwCourseForm from "./UwCourseForm";
import CustomCourseForm from "./CustomCourseForm";
import AddCourseTextSearch from "./AddCourseTextSearch";
import type { UwCourseFormState, TextSearchState } from "./types";

const WS_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_WS_URL
    : import.meta.env.VITE_DEV_WS_URL;

const SEARCH_REGEX = /^\s*(?:[A-Z&]+ )+\d{3}\b/;
// Strips away leading whitespace
// Will not match if >3 numbers in ID

const FINAL_COURSES_DICT = new Map(FINAL_COURSES.map(c => [c.id, c]));

interface AddCourseDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  nodeData: NodeDataMap;
  addCourseNode: (
    newNode: CourseNode,
    connectTo: ConnectTo,
    newCoursePosition: NewCoursePosition,
  ) => void;
  addExternalFlow: (extElems: Element[], connectTo: ConnectTo) => void;
}
export default function AddCourseDialog({
  modalCls,
  closeDialog,
  nodeData,
  addCourseNode,
  addExternalFlow,
}: AddCourseDialogProps): JSX.Element {
  const [tabIndex, setTabIndex] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);

  const focusSearchRef = useRef<() => void>(() => {});
  const [uwcfState, setUwcfState] = useState<UwCourseFormState>({
    campus: "Seattle",
    searchText: "",
    connectTo: { prereq: true, postreq: true },
    alwaysAtZero: false,
    errorMsg: "",
  });
  function setUwErrorMsg(errorMsg: string): void {
    setUwcfState(prev => ({ ...prev, errorMsg }));
  }
  const [autocompleteOpts, setAutocompleteOpts] = useState<
    ComboboxOptionProps[]
  >([]);

  const [customCourseData, setCustomCourseData] = useState<CourseData>({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

  const [tsState, setTsState] = useState<TextSearchState>({
    text: "",
    connectTo: { prereq: true, postreq: true },
    errorMsg: "",
  });
  function setTextSearchErrorMsg(errorMsg: string): void {
    setTsState(prev => ({ ...prev, errorMsg }));
  }

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065#issuecomment-446425911
  const websocket = useRef<WebSocket>();
  useEffect(() => {
    const wsConnection = new WebSocket(WS_URL);
    websocket.current = wsConnection;
    window.addEventListener("beforeunload", () => {
      wsConnection.close(1000);
    });
    wsConnection.addEventListener("message", event => {
      setAutocompleteOpts(
        JSON.parse(event.data).map((courseData: CourseData) => (
          <ComboboxOption key={courseData.id} value={courseData.id}>
            <ComboboxOptionText />: {courseData.name}
          </ComboboxOption>
        )),
      );
    });
    wsConnection.addEventListener("error", event => {
      setConnectionError(true);
      // eslint-disable-next-line no-console
      console.error(event);
    });
    return () => {
      wsConnection.close(1000);
    };
  }, []);

  const prefersReducedMotion = usePrefersReducedMotion();
  function close(): void {
    setUwErrorMsg("");
    setTextSearchErrorMsg("");
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setAutocompleteOpts([]);
      }, 100);
    } else {
      setAutocompleteOpts([]);
    }
  }

  function addNewNode(
    data: CourseData,
    position: NewCoursePosition,
    connectTo: ConnectTo = { prereq: false, postreq: false },
  ): void {
    const node = newCourseNode(data);
    node.position = {
      x: Math.random() * 150,
      y: Math.random() * 300,
    };
    // Add fuzzing to stop multiple nodes from piling
    // This position will be overwritten in addCourseNode() if
    // position arg is "relative"
    addCourseNode(node, connectTo, position);
  }

  async function fetchCourse(event: MouseEvent): Promise<void> {
    event.preventDefault();

    if (!uwcfState.searchText.trim()) {
      return;
    }

    const courseMatch = uwcfState.searchText.match(SEARCH_REGEX);
    if (!courseMatch) {
      setUwErrorMsg("Invalid course ID");
      focusSearchRef.current();
      return;
    }

    const searchQuery = courseMatch[0].trim();
    if (nodeData.has(searchQuery)) {
      setUwErrorMsg("Course already exists");
      focusSearchRef.current();
      return;
    }

    setUwErrorMsg("");
    setBusy(true);

    if (FINAL_COURSES_DICT.has(searchQuery)) {
      addNewNode(
        FINAL_COURSES_DICT.get(searchQuery)!,
        uwcfState.alwaysAtZero ? "zero" : "relative",
        uwcfState.connectTo,
      );
    } else {
      setUwErrorMsg("Course not found");
    }

    setBusy(false);
    focusSearchRef.current();
  }

  async function addCoursesFromText(event: MouseEvent): Promise<void> {
    event.preventDefault();
    setTextSearchErrorMsg("");
    setBusy(true);

    const courseIds = [...new Set(courseIdMatch(tsState.text) || [])];

    if (!courseIds.length) {
      setTextSearchErrorMsg("No course IDs found");
      setBusy(false);
      return;
    }

    const toAdd = new Set(courseIds.filter(m => !nodeData.has(m)));
    if (!toAdd.size) {
      setTextSearchErrorMsg("All found courses already exist");
      setBusy(false);
      return;
    }

    const data = FINAL_COURSES.filter(c => toAdd.has(c.id));
    if (data.length) {
      const newElements = generateInitialElements(data, "aggressively");
      addExternalFlow(newElements, tsState.connectTo);
      setTsState(prev => ({ ...prev, text: "" }));
      setBusy(false);
    } else {
      setTextSearchErrorMsg("No matching courses found");
      setBusy(false);
    }
  }

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      busy={busy}
      contentCls="AddCourseDialog"
      contentAriaLabel="Add course dialog"
    >
      <h2 className={connectionError ? "connection-error" : ""}>Add courses</h2>
      <Tabs index={tabIndex} onChange={i => setTabIndex(i)}>
        <TabList>
          <Tab disabled={busy}>UW course</Tab>
          <Tab disabled={busy}>Custom course</Tab>
          <Tab disabled={busy}>Text search</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <UwCourseForm
              tabIndex={tabIndex}
              connectionError={connectionError}
              websocket={websocket}
              uwcfState={uwcfState}
              setUwcfState={setUwcfState}
              autocompleteOpts={autocompleteOpts}
              setAutocompleteOpts={setAutocompleteOpts}
              fetchCourse={fetchCourse}
              busy={busy}
              focusSearchRef={focusSearchRef}
            />
          </TabPanel>
          <TabPanel className="AddCourseDialog__custom-course-tab-panel">
            <CustomCourseForm
              tabIndex={tabIndex}
              busy={busy}
              setBusy={setBusy}
              nodeData={nodeData}
              customCourseData={customCourseData}
              setCustomCourseData={setCustomCourseData}
              addNewNode={addNewNode}
            />
          </TabPanel>
          <TabPanel className="AddCourseDialog__text-search-tab-panel">
            <AddCourseTextSearch
              tabIndex={tabIndex}
              connectionError={connectionError}
              tsState={tsState}
              setTsState={setTsState}
              busy={busy}
              addCoursesFromText={addCoursesFromText}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalDialog>
  );
}
