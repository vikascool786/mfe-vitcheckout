interface LabelValue {
  label: string;
  value: string;
}

export function getOptionStringValue(
  data: Array<{ optionStringValue: string; name: string; type: string }>
): string | LabelValue[] | undefined {
  if (data[0] && data.length === 1) {
    return data[0].optionStringValue;
  } else if (data.length > 1) {
    const defaultLabels = ["Size:", "Color:"];

    return data.map((item, index) => ({
      label: item.name || (defaultLabels[index] as string),
      value: item.optionStringValue,
    }));
  }

  return undefined;
}
