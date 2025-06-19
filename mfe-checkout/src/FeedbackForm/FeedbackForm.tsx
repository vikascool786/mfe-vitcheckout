import React, { useState, useMemo, useRef, useEffect } from "react";
import "./FeedbackForm.scss";
import { Spinner } from "../component/Spinner/Spinner";
import { postFeedback } from "../api/service/Feedback";
import { IFeedback } from "../utils/types/types";
import {
  GET_API_ENDPOINT_BASE_URL,
  GET_API_MODE,
} from "../utils/helpers/urlResolvers";
import { useContentStrings } from "../hooks/useContentStrings";

const FeedbackForm: React.FC<IFeedback> = ({ pcId, sessionId, siteId }) => {
  const [isloading, setLoading] = useState(false);
  const [isFeebbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const feedbackFormRef = useRef<HTMLDivElement>(null);
  const { getString } = useContentStrings();

  const apiMode = useMemo(() => GET_API_MODE(), []);
  const apiBaseUrl = useMemo(() => {
    return GET_API_ENDPOINT_BASE_URL(apiMode);
  }, []);

  useEffect(() => {
    if (feedbackFormRef.current) {
      feedbackFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  if (isloading) return <Spinner />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      const errorString = getString('pleaseEnterComment')  || "";
      setError(errorString);
    } else {
      setLoading(true);
      try {
        await postFeedback(
          apiBaseUrl,
          feedback,
          pcId == "" ? null : pcId,
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
    <div className="feedback-form" ref={feedbackFormRef}>
      {!isFeebbackSubmitted ? (
        <>
          <p className="feedback-form__text">
            {getString("weConstantlyStriveAndGreatly")}
          </p>
          <p className="feedback-form__email-prompt">
            {getString("provideEmailForContact")}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="feedback-form__input-group">
              <label className="feedback_label">{getString("feedback")}</label>
              <textarea
                id="feedback"
                className={"feedback-form__textarea"}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={getString("enterFeedbackHere-placeholder")}
              />
              {error && <p className="feedback-form__error">{error}</p>}
            </div>
            <button className="feedback-form__submit-button" type="submit">
              {getString("submitFeedback")}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="feedback-form__thanks">
            {getString("thanksForFeedback")}
          </p>
          <p className="feedback-form__review">
            {getString("ngSearchFeedback")}
          </p>
        </>
      )}
    </div>
  );
};

export default FeedbackForm;
