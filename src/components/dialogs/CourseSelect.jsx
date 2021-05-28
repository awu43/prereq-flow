import React from "react";
import PropTypes from "prop-types";

export default function CourseSelect({ courseData, generateNewFlow }) {
  function generate(_event) {

  }

  return (
    <div className="CourseSelect">
      <section className="required">

      </section>
      <section className="single-or">

      </section>
      <section className="ambiguous">

      </section>
      <button type="button" onClick={generate}>Generate flow</button>
    </div>
  );
}
CourseSelect.propTypes = {
  courseData: PropTypes.arrayOf(PropTypes.object).isRequired,
  generateNewFlow: PropTypes.func.isRequired,
};
