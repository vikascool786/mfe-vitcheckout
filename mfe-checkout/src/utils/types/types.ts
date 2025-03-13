export type APIMODE = "localhost" | "dev" | "staging" | "prod";

export type IFeedback = {
  sessionId: string;
  siteId: string;
  pcId: string;
};

export type DataObject = {
  [key: string]: any;
};

export interface IOrderNotification {
  message: string;
  code: number;
  developer_message: string;
  product_id: string;
}
