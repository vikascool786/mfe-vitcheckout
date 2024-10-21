import { DataLayer } from "./types/types";

const data_layer: string = "data_layer";

export function setDataLayerProperty(property: string, value: any) {
  if (
    !(window as { [key: string]: any })[data_layer] ||
    typeof (window as { [key: string]: any })[data_layer] !== "object"
  ) {
    (window as { [key: string]: any })[data_layer] = {} as DataLayer;
  }

  ((window as { [key: string]: any })[data_layer] as DataLayer)[property] =
    value;
}
