import type { RefObject } from "react";

import "./PreWarning.scss";

import type { SetState } from "types/main";

interface PreWarningProps {
  warningAccepted: number;
  setWarningAccepted: SetState<number>;
  closeButtonRef: RefObject<HTMLButtonElement>;
}
export default function PreWarning({
  warningAccepted,
  setWarningAccepted,
  closeButtonRef,
}: PreWarningProps): JSX.Element {
  return (
    <div className="PreWarning">
      <section>
        <h3>⚠️ Important information ⚠️</h3>
        <p>
          Prereq Flow is not an official University of Washington resource. No
          guarantees are made about the accuracy, completeness, or
          up-to-dateness of any information&nbsp;presented.
        </p>

        <p>Some limitations to keep in&nbsp;mind:</p>
        <ul>
          <li>Grouping and either/or conditions are not&nbsp;displayed.</li>
          <li>Co-requisite conditions are not&nbsp;displayed.</li>
          <li>Registration restrictions are not&nbsp;displayed.</li>
        </ul>

        <p>
          All caveats for{" "}
          <a
            href="https://prereqmap.uw.edu/"
            target="_blank"
            rel="noreferrer"
            tabIndex={warningAccepted ? -1 : 0}
          >
            Prereq Map
          </a>{" "}
          also apply&nbsp;here:
        </p>
        <ul>
          <li>
            Prerequisites and graduation requirements may change over&nbsp;time.
          </li>
          <li>
            Non-course graduation requirements (e.g. 5 credits of VLPA) are
            not&nbsp;displayed.
          </li>
          <li>
            Equivalencies (e.g. placements tests, AP credits) are
            not&nbsp;displayed.
          </li>
        </ul>
        <p>Talk to your advisor when course&nbsp;planning.</p>
        <div className="PreWarning__button-wrapper">
          <button
            className="PreWarning__accept-button"
            type="button"
            onClick={() => setWarningAccepted(1)}
            onKeyDown={event => {
              if (event.key === "Tab" && !warningAccepted) {
                event.preventDefault();
                closeButtonRef.current?.focus();
              }
            }}
            disabled={!!warningAccepted}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
}
