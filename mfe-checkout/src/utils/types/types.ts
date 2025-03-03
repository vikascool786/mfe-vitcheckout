export type APIMODE = "localhost" | "dev" | "staging" | "prod";

export type IFeedback = {
  sessionId: string;
  siteId: string;
  pcId: string;
};

export type DataObject = {
  [key: string]: any;
};
