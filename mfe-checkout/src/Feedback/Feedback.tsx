import React from "react";
import "./Feedback.scss";
import FeedbackForm from "../FeedbackForm/FeedbackForm";
import { IFeedback } from "../utils/types/types";
import { useContentStrings } from "../hooks/useContentStrings";

const Feedback: React.FC<IFeedback> = ({ pcId, sessionId, siteId }) => {
  const [isFormDisplayed, setFromDisplayed] = React.useState<boolean>(false);
  const { getString } = useContentStrings();
  return (
    <>
      <div className="feedback-container">
        <h2>{getString("wantToProvideFeedback")}</h2>
        <p>{getString("constantlyLookingToImprove")}</p>
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
