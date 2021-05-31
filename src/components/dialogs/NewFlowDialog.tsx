import React, { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";
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

import CloseButton from "./CloseButton";
import PreWarning from "./PreWarning";
import DegreeSelect from "./DegreeSelect";
import CurriculumSelect from "./CurriculumSelect";
import usePrefersReducedMotion from "../../usePrefersReducedMotion";

import {
  isNode,
  isEdge,
  removeElements,
  COURSE_REGEX,
  generateInitialElements,
} from "../../utils";

import "./NewFlowDialog.scss";

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

  const prefersReducedMotion = usePrefersReducedMotion();
  function close(): void {
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

  const [supportedMajors, setSupportedMajors] = useState<string[]>([]);
  const [degreeError, setDegreeError] = useState("");

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

  const [
    supportedCurricula,
    setSupportedCurricula
  ] = useState<Map<Campus, HTMLOptionElement[]>>(new Map());
  const [curriculumError, setCurriculumError] = useState("");

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
          const courseMatches: RegExpMatchArray = (
            course.prerequisite.match(COURSE_REGEX)
          );
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

  function newBlankFlow(): void {
    setBusy(true);
    generateNewFlow([]);
    close();
  }

  const slideNum = warningAccepted + slideState;
  const closeButtonRef = useRef(null);

  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      // Reach UI is not TS friendly here
      onDismiss={event => {
        if ((event as KeyboardEvent).key === "Escape" && !busy) {
          closeDialog();
        }
      }}
    >
      <DialogContent className="NewFlowDialog" aria-label="New flow dialog">
        <CloseButton btnRef={closeButtonRef} onClick={close} disabled={busy} />
        <h2 className={connectionError ? "connection-error" : ""}>
          New flow
        </h2>
        <hr />
        <div
          className={`NewFlowDialog__slides slide-${slideNum}`}
        >
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
              }}
            >
              <TabList>
                <Tab disabled={busy}>Degree</Tab>
                <Tab disabled={busy}>Curriculum</Tab>
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
      </DialogContent>
    </DialogOverlay>
  );
}
