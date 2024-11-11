import React from "react";
import "./ShippingOptionItem.scss";
import { RadioButton } from "../component/RadioButton/RadioButton";

interface IShippingOption {
  shippingType: string;
  arrivesIn: string;
  price: string;
  isSelected?: boolean;
}

interface IShippingOptionItem {
  shippingOption: IShippingOption;
  index: number;
  size: number;
  onChange: () => void;
}

export const ShippingOptionItem: React.FC<IShippingOptionItem> = ({
  shippingOption,
  onChange,
  index,
  size,
}) => {
  const isSelected = shippingOption?.isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isLast = index === size ? "end" : "";

  return (
    <div
      className={`shipping-option-container ${isSelected} ${isFirst} ${isLast}`}
    >
      <div className="shipping-option-select-container">
        <RadioButton id={shippingOption.shippingType} onChange={onChange} checked={shippingOption.isSelected} />
        <div className={`shipping-option-sub-container`}>
          <div>{shippingOption.shippingType}</div>
          <div>{shippingOption.arrivesIn}</div>
        </div>
      </div>

      <div>{shippingOption.price}</div>
    </div>
  );
};
