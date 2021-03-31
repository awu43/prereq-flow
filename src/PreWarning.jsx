import React from "react";
import PropTypes from "prop-types";

export default function PreWarning({ accept }) {
  return (
    <div className="PreWarning">
      <section>
        <h3>⚠️ Important information ⚠️</h3>
        <p>Prereq Flow is not an official University of Washington resource and is undergoing active development. Any saved data may be become unusable at any time with no warning. No guarantees are made about the accuracy, completeness, or up-to-dateness of any information presented.</p>

        <p>Some limitations to keep in mind:</p>
        <ul>
          <li>Grouping and either/or conditions are not displayed.</li>
          <li>Co-requisite condition is not displayed.</li>
          <li>Registration restrictions are not displayed.</li>
        </ul>

        <p>All caveats for <a href="https://prereqmap.uw.edu/" target="_blank" rel="noreferrer">Prereq Map</a> also apply here:</p>
        <ul>
          <li>Prerequisites and graduation requirements may change over time.</li>
          <li>Non-course graduation requirements (e.g. 5 credits of VLPA) are not displayed.</li>
          <li>Equivalencies (e.g. placements tests, AP credits) are not displayed.</li>
        </ul>
        <p>Talk to your advisor when course planning.</p>
        <button type="button" onClick={accept}>Continue</button>
      </section>
    </div>
  );
}
PreWarning.propTypes = {
  accept: PropTypes.func.isRequired,
};
