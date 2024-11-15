import React, { useState, useMemo } from "react";
import "./FeedbackForm.scss";
import Spinner from "../Spinner/Spinner";
import { postFeedback } from "../../api/service/feedback";
import { useAtomValue } from "jotai";
import { searchAppConfig } from "../../utils/types/types";
import { appConfigAtom } from "mfeStore/store";
import {
  GET_API_ENDPOINT_BASE_URL,
  GET_API_MODE,
} from "../../utils/urlResolvers";

const FeedbackForm: React.FC = () => {
  const [isloading, setLoading] = useState(false);
  const appConfigValue = useAtomValue<searchAppConfig>(appConfigAtom);
  const [isFeebbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const { sessionId, siteId } = appConfigValue;

  const apiMode = useMemo(() => GET_API_MODE(), []);
  const apiBaseUrl = useMemo(() => {
    return GET_API_ENDPOINT_BASE_URL(apiMode);
  }, []);

  if (isloading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Please enter a comment.");
    } else {
      setLoading(true);
      try {
        await postFeedback(
          apiBaseUrl,
          feedback,
          appConfigValue.pcId == "" ? null : appConfigValue.pcId,
          sessionId,
          siteId
        );
      } catch (err) {
        setLoading(false);
        setFeedbackSubmitted(true);
      } finally {
        setLoading(false);
        setFeedbackSubmitted(true);
      }
    }
  };

  return (
    <div className="feedback-form">
      {!isFeebbackSubmitted ? (
        <>
          <p className="feedback-form__text">
            We consistently look for ways to improve your experience and greatly
            appreciate your feedback.
          </p>
          <p className="feedback-form__email-prompt">
            Please provide your email if you would like to be contacted.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="feedback-form__input-group">
              <label className="feedback_label">Feedback</label>
              <textarea
                id="feedback"
                className={"feedback-form__textarea"}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback here..."
              />
              {error && <p className="feedback-form__error">{error}</p>}
            </div>
            <button className="feedback-form__submit-button" type="submit">
              Submit Feedback
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="feedback-form__thanks">Thank you for your feedback!</p>
          <p className="feedback-form__review">
            We appreciate you taking the time to help us improve our search
            experience. Your insights will directly shape a better search
            experience for you and others.
          </p>
        </>
      )}
    </div>
  );
};

export default FeedbackForm;
