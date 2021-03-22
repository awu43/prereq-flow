import React, { useState, useRef } from "react";

export default function CourseSelect() {
  function generate(event) {
    event.preventDefault();
  }

  return (
    <div className="CourseSelect">
      <section className="required">

      </section>
      <section className="single-or">

      </section>
      <section className="ambiguous">

      </section>
      <button type="submit" onClick={generate}>Generate flow</button>
    </div>
  );
}
