import { useState, useRef, useEffect } from "react";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import { useAtomValue } from "jotai";
import { getConnectedEdges } from "react-flow-renderer";

import type { Edge, Element } from "types/main";
import {
  courseIdMatch,
  isNode,
  isEdge,
  removeElements,
  generateInitialElements,
} from "@utils";
import type { ModalClass, CloseModal } from "@useDialogStatus";
import usePrefersReducedMotion from "@usePrefersReducedMotion";

import "./index.scss";
import FINAL_CURRICULA from "@data/final_seattle_curricula.json";
import FINAL_MAJORS from "@data/final_majors.json";
import { courseMapAtom } from "@state";
import ModalDialog from "../ModalDialog";
import type {
  DegreeSelectState,
  CurriculumSelectState,
  TextSearchState,
} from "./types";
import PreWarning from "./PreWarning";
import DegreeSelect from "./DegreeSelect";
import CurriculumSelect from "./CurriculumSelect";
import NewFlowTextSearch from "./NewFlowTextSearch";

const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_API_URL
    : import.meta.env.VITE_DEV_API_URL;

interface NewFlowDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  generateNewFlow: (elems: Element[]) => void;
}
export default function NewFlowDialog({
  modalCls,
  closeDialog,
  generateNewFlow,
}: NewFlowDialogProps): JSX.Element {
  const [connectionError, _setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const courseMap = useAtomValue(courseMapAtom);
  const [supportedMajors, _setSupportedMajors] = useState(
    FINAL_MAJORS as [string, string[]][],
  );
  const supportedMajorsMapRef = useRef<Map<string, string[]>>(new Map());
  useEffect(() => {
    supportedMajorsMapRef.current = new Map(supportedMajors);
  }, supportedMajors);
  const [degreeSelectState, setDegreeSelectState] = useState<DegreeSelectState>(
    {
      majors: [],
      selected: "",
      ambiguityHandling: "aggressively",
      errorMsg: "",
    },
  );
  function setDegreeError(errorMsg: string): void {
    setDegreeSelectState(prev => ({ ...prev, errorMsg }));
  }

  const [supportedCurricula, _setSupportedCurricula] = useState(
    FINAL_CURRICULA as [string, string][],
  );
  const [curriculumSelectState, setCurriculumSelectState] =
    useState<CurriculumSelectState>({
      selected: "",
      includeExternal: false,
      ambiguityHandling: "aggressively",
      errorMsg: "",
    });
  function setCurriculumError(errorMsg: string): void {
    setCurriculumSelectState(prev => ({ ...prev, errorMsg }));
  }

  const [textSearchState, setTextSearchState] = useState<TextSearchState>({
    text: "",
    ambiguityHandling: "aggressively",
    errorMsg: "",
  });
  function setTextSearchError(errorMsg: string): void {
    setTextSearchState(prev => ({ ...prev, errorMsg }));
  }

  const prefersReducedMotion = usePrefersReducedMotion();

  function close(): void {
    setDegreeError("");
    setCurriculumError("");
    setTextSearchError("");
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setBusy(false);
        setSlideState(0);
      }, 100);
    } else {
      setBusy(false);
      setSlideState(0);
    }
  }

  // function advanceSlide() {
  //   setSlideState(slideState + 1);
  // }

  async function newDegreeFlow(): Promise<void> {
    setBusy(true);
    setDegreeError("");

    const data = [
      ...new Set(
        degreeSelectState.majors
          .map(m => supportedMajorsMapRef.current.get(m)!)
          .flat(),
      ),
    ].map(c => courseMap.get(c)!);
    const newElements = generateInitialElements(
      data,
      degreeSelectState.ambiguityHandling,
    );
    generateNewFlow(newElements);
    close();

    // advanceSlide();
    // if (!prefersReducedMotion) {
    //   setTimeout(() => {
    //     setBusy(false);
    //   }, 250);
    // } else {
    //   setBusy(false);
    // }
  }

  async function newCurriculumFlow(): Promise<void> {
    setBusy(true);
    setCurriculumError("");
    const curriculumId = curriculumSelectState.selected;
    try {
      const resp = await fetch(`${API_URL}/curricula/${curriculumId}`);
      const data = await resp.json();

      if (curriculumSelectState.includeExternal) {
        const externalPrereqs = [];
        for (const course of data) {
          const courseMatches = courseIdMatch(
            course.prerequisite,
          ) as RegExpMatchArray;
          const external = courseMatches
            ? courseMatches.filter(
                courseId => !courseId.startsWith(curriculumId),
              )
            : [];
          externalPrereqs.push(...external);
        }
        if (externalPrereqs.length) {
          const externalResp = await fetch(`${API_URL}/courses/`, {
            method: "POST",
            headers: { contentType: "application/json" },
            body: JSON.stringify(externalPrereqs),
          });
          const externalData = await externalResp.json();
          data.push(...externalData);
        }
      }

      const newElements = generateInitialElements(
        data,
        curriculumSelectState.ambiguityHandling,
      );
      const edges = newElements.filter(elem => isEdge(elem));
      const externalOrphans = newElements.filter(
        elem =>
          isNode(elem) &&
          !elem.id.startsWith(curriculumId) &&
          !getConnectedEdges([elem], edges as Edge[]).length,
        // Not connected to any other nodes
      );

      generateNewFlow(removeElements(externalOrphans, newElements));
      close();
    } catch (error) {
      setCurriculumError("Something went wrong");
      // eslint-disable-next-line no-console
      console.error(error);
      setBusy(false);
    }
  }

  async function newTextSearchFlow(): Promise<void> {
    setBusy(true);
    setTextSearchError("");

    const courseMatches = courseIdMatch(textSearchState.text) ?? [];
    const courses = [...new Set(courseMatches)];

    if (!courses.length) {
      setTextSearchError("No course IDs found");
      setBusy(false);
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/courses/`, {
        method: "POST",
        headers: { contentType: "application/json" },
        body: JSON.stringify(courses),
      });

      if (resp.status === 404) {
        setTextSearchError("No matching courses found");
        setBusy(false);
        return;
      }

      const data = await resp.json();

      const newElements = generateInitialElements(
        data,
        textSearchState.ambiguityHandling,
      );
      generateNewFlow(newElements);
      setTextSearchState(prev => ({ ...prev, text: "" }));
      close();
    } catch (error) {
      setTextSearchError("Something went wrong");
      // eslint-disable-next-line no-console
      console.error(error);
      setBusy(false);
    }
  }

  function newBlankFlow(): void {
    setBusy(true);
    generateNewFlow([]);
    close();
  }

  const slideNum = warningAccepted + slideState;
  const closeButtonRef = useRef(null);

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      closeBtnRef={closeButtonRef}
      busy={busy}
      contentCls="NewFlowDialog"
      contentAriaLabel="New flow dialog"
    >
      <h2 className={connectionError ? "connection-error" : ""}>New flow</h2>
      <hr />
      <div className={`NewFlowDialog__slides slide-${slideNum}`}>
        <PreWarning
          warningAccepted={warningAccepted}
          setWarningAccepted={setWarningAccepted}
          closeButtonRef={closeButtonRef}
        />
        <form className="FlowType">
          <Tabs
            index={tabIndex}
            onChange={index => {
              setTabIndex(index);
            }}
          >
            <TabList>
              <Tab disabled={busy}>Degree</Tab>
              <Tab disabled={busy}>Curriculum</Tab>
              <Tab disabled={busy}>Text search</Tab>
              <Tab disabled={busy}>Blank</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <DegreeSelect
                  tabIndex={tabIndex}
                  connectionError={connectionError}
                  busy={busy}
                  supportedMajors={supportedMajors}
                  dsState={degreeSelectState}
                  setDsState={setDegreeSelectState}
                  newDegreeFlow={newDegreeFlow}
                />
              </TabPanel>
              <TabPanel>
                <CurriculumSelect
                  tabIndex={tabIndex}
                  connectionError={connectionError}
                  busy={busy}
                  supportedCurricula={supportedCurricula}
                  csState={curriculumSelectState}
                  setCsState={setCurriculumSelectState}
                  newCurriculumFlow={newCurriculumFlow}
                />
              </TabPanel>
              <TabPanel>
                <NewFlowTextSearch
                  tabIndex={tabIndex}
                  connectionError={connectionError}
                  busy={busy}
                  tsState={textSearchState}
                  setTsState={setTextSearchState}
                  newTextSearchFlow={newTextSearchFlow}
                />
              </TabPanel>
              <TabPanel>
                <div className="NewBlankFlow">
                  <p>Generate a new blank flow.</p>
                  <div className="NewBlankFlow__button-wrapper">
                    <button
                      type="button"
                      className="NewBlankFlow__generate-button"
                      onClick={newBlankFlow}
                    >
                      Generate
                    </button>
                  </div>
                  <div className="NewBlankFlow__end-padding"></div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </form>
      </div>
      {/* Flex, 2x width + transform */}
    </ModalDialog>
  );
}
