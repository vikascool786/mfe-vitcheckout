import axiosInstance from "../axios";

const getFeedbackPath = (pcId: string | null | undefined) =>
  `/site-surveys/v1/Survey/${pcId}`;

export const postFeedback = async (
  baseUrl: string,
  feedback: string,
  pcId?: null | string | undefined,
  sessionId?: string | number | undefined,
  siteId?: string | number | undefined
): Promise<any> => {
  const baseUrlWithSiteId = baseUrl + `&siteId=${siteId}`;
  const apiEndpoint = baseUrlWithSiteId.replace(
    "{{path}}",
    getFeedbackPath(pcId)
  );
  const feedbackPayload = {
    classid: 36,
    comments: feedback,
    httpreferrer: window.location.href,
    orderid: 0,
    surveytypeid: 17,
    userSessionId: sessionId || -1,
  };

  try {
    const res = await axiosInstance(apiEndpoint)
      .post("", feedbackPayload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));

    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
