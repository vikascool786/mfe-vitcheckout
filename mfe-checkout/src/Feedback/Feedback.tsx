import React from "react";
import "./Feedback.scss";
import FeedbackForm from "../FeedbackForm/FeedbackForm";
import { IFeedback } from "../utils/types/types";

const Feedback: React.FC<IFeedback> = ({ pcId, sessionId, siteId }) => {
  const [isFormDisplayed, setFromDisplayed] = React.useState<boolean>(false);
  return (
    <>
      <div className="feedback-container">
        <h2>Want to Provide Feedback?</h2>
        <p>We are constantly looking for ways to improve.</p>
        <button
          className="feedback-button"
          onClick={() => setFromDisplayed(true)}
        >
          Give Feedback
        </button>
      </div>
      {isFormDisplayed && (
        <FeedbackForm pcId={pcId} siteId={siteId} sessionId={sessionId} />
      )}
    </>
  );
};

export default Feedback;
