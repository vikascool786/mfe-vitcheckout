import { DataObject } from "../types/types";

const dataObject: string = "dataObject";

export function setDataObjectProperty(property: string, value: any) {
  if (
    !(window as { [key: string]: any })[dataObject] ||
    typeof (window as { [key: string]: any })[dataObject] !== "object"
  ) {
    (window as { [key: string]: any })[dataObject] = {} as DataObject;
  }

  ((window as { [key: string]: any })[dataObject] as DataObject)[property] =
    value;
}
