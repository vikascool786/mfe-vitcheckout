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
}

export const ShippingOptionItem: React.FC<IShippingOptionItem> = ({
  shippingOption,
}) => {
  const isSelected = shippingOption?.isSelected && "selected";
  return (
    <div className={`shipping-option-container ${isSelected}`}>
      <div className="shipping-option-select-container">
        <RadioButton />
        <div className={`shipping-option-sub-container`}>
          <div>{shippingOption.shippingType}</div>
          <div>{shippingOption.arrivesIn}</div>
        </div>
      </div>

      <div>{shippingOption.price}</div>
    </div>
  );
};
