import { useState, useRef, useEffect } from "react";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

import { getConnectedEdges } from "react-flow-renderer";

import type { Campus, Edge, Element } from "types/main";
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
import ModalDialog from "../ModalDialog";
import type { AmbiguityHandling } from "../AmbiguitySelect";
import type {
  DegreeSelectState,
  CurriculumSelectState,
  // TextSearchState,
} from "./types";
import PreWarning from "./PreWarning";
import DegreeSelect from "./DegreeSelect";
import CurriculumSelect from "./CurriculumSelect";
import NewFlowTextSearch from "./NewFlowTextSearch";

interface CurriculumData {
  campus: Campus;
  id: string;
  name: string;
}

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
  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const [supportedMajors, setSupportedMajors] = useState<string[]>([]);
  // const [degreeError, setDegreeError] = useState("");
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

  const [supportedCurricula, setSupportedCurricula] = useState<
    Record<Campus, [id: string, name: string][]>
  >({ Seattle: [], Bothell: [], Tacoma: [] });
  // const [curriculumError, setCurriculumError] = useState("");
  const [curriculumSelectState, setCurriculumSelectState] =
    useState<CurriculumSelectState>({
      campus: "Seattle",
      selected: { Seattle: "", Bothell: "", Tacoma: "" },
      includeExternal: false,
      ambiguityHandling: "aggressively",
      errorMsg: "",
    });
  function setCurriculumError(errorMsg: string): void {
    setCurriculumSelectState(prev => ({ ...prev, errorMsg }));
  }

  const [textSearchError, setTextSearchError] = useState("");
  // const [textSearchState, setTextSearchState] = useState<TextSearchState>({
  //   text: "",
  //   ambiguityHandling: "aggressively",
  //   errorMsg: "",
  // });

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
        // const curricula = new Map(
        //   Object.entries({
        //     Seattle: [],
        //     Bothell: [],
        //     Tacoma: [],
        //   }),
        //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // ) as Map<Campus, any>;

        // for (const datum of data) {
        //   curricula.get(datum.campus).push(datum);
        // }
        // // Values initially CurriculumData[]

        // for (const campus of curricula.keys()) {
        //   curricula
        //     .get(campus)
        //     .sort((a: CurriculumData, b: CurriculumData) =>
        //       a.id.localeCompare(b.id),
        //     );
        //   curricula.set(
        //     campus,
        //     curricula.get(campus).map((curr: CurriculumData) => (
        //       <option key={curr.id} value={curr.id}>
        //         {`${curr.id}: ${curr.name}`}
        //       </option>
        //     )),
        //   );
        // }
        // Now HTMLOptionElement[]

        const curriculaData: Record<Campus, CurriculumData[]> = {
          Seattle: [],
          Bothell: [],
          Tacoma: [],
        };
        for (const datum of data) {
          curriculaData[datum.campus].push(datum);
        }

        const curricula: Record<Campus, [string, string][]> = {
          Seattle: [],
          Bothell: [],
          Tacoma: [],
        };
        for (const campus of Object.keys(curricula) as Campus[]) {
          curricula[campus] = curriculaData[campus]
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(c => [c.id, c.name]);
        }

        setSupportedCurricula(curricula);
      })
      .catch(error => {
        setConnectionError(true);
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  async function newDegreeFlow(): Promise<void> {
    setBusy(true);
    setDegreeError("");
    try {
      const resp = await fetch(`${API_URL}/degrees/`, {
        method: "POST",
        headers: { contentType: "application/json" },
        body: JSON.stringify(degreeSelectState.majors),
      });
      const data = await resp.json();

      const newElements = generateInitialElements(
        data,
        degreeSelectState.ambiguityHandling,
      );
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

  async function newCurriculumFlow(): Promise<void> {
    setBusy(true);
    setCurriculumError("");
    const curriculumId =
      curriculumSelectState.selected[curriculumSelectState.campus];
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
              setDegreeError("");
              setCurriculumError("");
              setTextSearchError("");
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
                  connectionError={connectionError}
                  busy={busy}
                  setBusy={setBusy}
                  // tsState={textSearchState}
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
