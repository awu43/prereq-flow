import React from "react";
import PropTypes from "prop-types";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import "@reach/combobox/styles.css";

import DegreeSelect from "./DegreeSelect.jsx";
import CurriculumSelect from "./CurriculumSelect.jsx";

export default function FlowType({
  busy, setBusy, supportedMajors, supportedCurricula, onCoursesFetched
}) {
  return (
    <form className="FlowType">
      <Tabs>
        <TabList>
          <Tab>Degree</Tab>
          <Tab>Curriculum</Tab>
          <Tab>Blank</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DegreeSelect
              supportedMajors={supportedMajors}
              busy={busy}
              setBusy={setBusy}
              advance={onCoursesFetched}
            />
          </TabPanel>
          <TabPanel>
            <CurriculumSelect
              supportedCurricula={supportedCurricula}
              busy={busy}
              setBusy={setBusy}
              advance={onCoursesFetched}
            />
          </TabPanel>
          <TabPanel>
            <div className="NewBlankFlow">
              <p>Generate a new blank flow.</p>
              <div className="NewBlankFlow__button-wrapper">
                <button type="button" className="NewBlankFlow__generate-button">
                  Generate
                </button>
              </div>
              <div className="NewBlankFlow__end-padding"></div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </form>
  );
}

FlowType.propTypes = {
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  supportedMajors: PropTypes.arrayOf(PropTypes.string).isRequired,
  supportedCurricula: PropTypes.instanceOf(Map).isRequired,
  onCoursesFetched: PropTypes.func.isRequired,
};
