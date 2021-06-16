import React, { useState, useRef, useEffect } from "react";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import {
  getConnectedEdges,
} from "react-flow-renderer";

import type {
  Campus,
  CurriculumData,
  ModalClass,
  CloseModal,
  AmbiguityHandling,
  Edge,
  Element,
} from "types/main";

import "./NewFlowDialog.scss";
import ModalDialog from "./ModalDialog";
import CloseButton from "./CloseButton";
import PreWarning from "./PreWarning";
import DegreeSelect from "./DegreeSelect";
import CurriculumSelect from "./CurriculumSelect";
import NewFlowTextSearch from "./NewFlowTextSearch";
import usePrefersReducedMotion from "../../usePrefersReducedMotion";

import {
  courseIdMatch,
  isNode,
  isEdge,
  removeElements,
  generateInitialElements,
} from "../../utils";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

interface NewFlowDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  generateNewFlow: (elems: Element[]) => void;
}
export default function NewFlowDialog({
  modalCls,
  closeDialog,
  generateNewFlow,
}: NewFlowDialogProps) {
  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);

  const [supportedMajors, setSupportedMajors] = useState<string[]>([]);
  const [degreeError, setDegreeError] = useState("");
  const [
    supportedCurricula,
    setSupportedCurricula
  ] = useState<Map<Campus, HTMLOptionElement[]>>(new Map());
  const [curriculumError, setCurriculumError] = useState("");
  const [textSearchError, setTextSearchError] = useState("");

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

  useEffect(() => {
    fetch(`${API_URL}/degrees/`)
      .then(resp => resp.json())
      .then(data => setSupportedMajors(data))
      .catch(error => {
        setConnectionError(true);
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/curricula/`)
      .then(resp => resp.json())
      .then((data: CurriculumData[]) => {
        const curricula = new Map(Object.entries({
          Seattle: [],
          Bothell: [],
          Tacoma: [],
        })) as Map<Campus, any>;

        for (const datum of data) {
          curricula.get(datum.campus).push(datum);
        }
        // Values initially CurriculumData[]

        for (const campus of curricula.keys()) {
          curricula.get(campus).sort((a: CurriculumData, b: CurriculumData) => (
            a.id.localeCompare(b.id)
          ));
          curricula.set(
            campus,
            curricula.get(campus).map((curr: CurriculumData) => (
              <option key={curr.id} value={curr.id}>
                {`${curr.id}: ${curr.name}`}
              </option>
            ))
          );
        }
        // Now HTMLOptionElement[]

        setSupportedCurricula(curricula);
      })
      .catch(error => {
        setConnectionError(true);
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  async function newDegreeFlow(
    majors: string[],
    ambiguityHandling: AmbiguityHandling
  ): Promise<void> {
    setDegreeError("");
    try {
      const resp = await fetch(`${API_URL}/degrees/`, {
        method: "POST",
        headers: { contentType: "application/json" },
        body: JSON.stringify(majors),
      });
      const data = await resp.json();

      const newElements = generateInitialElements(data, ambiguityHandling);
      generateNewFlow(newElements);
      close();
    } catch (error) {
      setDegreeError("Something went wrong");
      setBusy(false);
      // eslint-disable-next-line no-console
      console.error(error);
    }

    // advanceSlide();
    // if (!prefersReducedMotion) {
    //   setTimeout(() => {
    //     setBusy(false);
    //   }, 250);
    // } else {
    //   setBusy(false);
    // }
  }

  async function newCurriculumFlow(
    curriculum: string,
    includeExternal: boolean,
    ambiguityHandling: AmbiguityHandling,
  ): Promise<void> {
    setCurriculumError("");
    try {
      const resp = await fetch(`${API_URL}/curricula/${curriculum}`);
      const data = await resp.json();

      if (includeExternal) {
        const externalPrereqs = [];
        for (const course of data) {
          const courseMatches = courseIdMatch(
            course.prerequisite
          ) as RegExpMatchArray;
          const external = (
            courseMatches
              ? courseMatches.filter(
                courseId => !courseId.startsWith(curriculum)
              )
              : []
          );
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

      const newElements = generateInitialElements(data, ambiguityHandling);
      const edges = newElements.filter(elem => isEdge(elem));
      const externalOrphans = newElements.filter(elem => (
        isNode(elem)
        && !elem.id.startsWith(curriculum)
        && !getConnectedEdges([elem], edges as Edge[]).length
        // Not connected to any other nodes
      ));

      generateNewFlow(
        removeElements(externalOrphans, newElements)
      );
      close();
    } catch (error) {
      setCurriculumError("Something went wrong");
      // eslint-disable-next-line no-console
      console.error(error);
      setBusy(false);
    }
  }

  async function newTextSearchFlow(
    courses: string[],
    ambiguityHandling: AmbiguityHandling,
  ): Promise<void> {
    if (!courses.length) {
      setTextSearchError("No course IDs found");
      setBusy(false);
      return;
    }

    setTextSearchError("");
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

      const newElements = generateInitialElements(data, ambiguityHandling);
      generateNewFlow(newElements);
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
      closeDialog={closeDialog}
      busy={busy}
      contentCls="NewFlowDialog"
      contentAriaLabel="New flow dialog"
    >
      <CloseButton btnRef={closeButtonRef} onClick={close} disabled={busy} />
      <h2 className={connectionError ? "connection-error" : ""}>
        New flow
      </h2>
      <hr />
      <div className={`NewFlowDialog__slides slide-${slideNum}`}>
        <PreWarning
          warningAccepted={warningAccepted}
          setWarningAccepted={setWarningAccepted}
          closeButtonRef={closeButtonRef}
        />
        <form className="FlowType">
          <Tabs
            onChange={() => {
              setDegreeError("");
              setCurriculumError("");
              setTextSearchError("");
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
                  connectionError={connectionError}
                  busy={busy}
                  setBusy={setBusy}
                  supportedMajors={supportedMajors}
                  newDegreeFlow={newDegreeFlow}
                  errorMsg={degreeError}
                />
              </TabPanel>
              <TabPanel>
                <CurriculumSelect
                  connectionError={connectionError}
                  busy={busy}
                  setBusy={setBusy}
                  supportedCurricula={supportedCurricula}
                  newCurriculumFlow={newCurriculumFlow}
                  errorMsg={curriculumError}
                />
              </TabPanel>
              <TabPanel>
                <NewFlowTextSearch
                  connectionError={connectionError}
                  busy={busy}
                  setBusy={setBusy}
                  newTextSearchFlow={newTextSearchFlow}
                  errorMsg={textSearchError}
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
