import React from "react";
import PropTypes from "prop-types";

export default function PreWarning({ accept }) {
  return (
    <div className="PreWarning">
      <section>
        <h3>⚠️ Important information ⚠️</h3>
        <p>Prereq Flow is not an official University of Washington resource and is undergoing active development. No guarantees are made about the accuracy, completeness, or up-to-dateness of information presented.</p>

        <p>Current limitations of Prereq Flow:</p>
        <ul>
          <li>
            Grouping and either/or are not supported:
            <ul>
              <li>For a graduation requirement like <q>MATH 308 or AMATH 352</q>, both nodes will be created with no guarantee of proximity.</li>
              <li>For equal prerequisites like <q>Either MATH 125, Q SCI 292, or MATH 135</q>, multiple nodes/connections may be created.</li>
            </ul>
          </li>
          <li>Electives are not included.</li>
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
