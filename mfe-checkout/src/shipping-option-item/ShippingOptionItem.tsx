import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import "./ShippingOptionItem.scss";

interface IShippingOption {
  shippingType: string;
  arrivesIn: string;
  price: string;
  isSelected?: boolean;
}

interface IShippingOptionItem {
  shippingOption: ShippingSelection;
  index: number;
  size: number;
  isSelected: boolean;
  onChange: () => void;
}

export const ShippingOptionItem: React.FC<IShippingOptionItem> = ({
  shippingOption,
  isSelected,
  onChange,
  index,
  size,
}) => {
  const select = isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isLast = index === size ? "end" : "";


  return (
    <div
      className={`shipping-option-container ${select} ${isFirst} ${isLast}`}
    >
      <div className="shipping-option-select-container">
        <RadioButton
          id={shippingOption.id.toString()}
          onChange={onChange}
          checked={shippingOption.isSelected}
        />
        <div className={`shipping-option-sub-container`}>
          <div>{shippingOption.method}</div>
          <div>{shippingOption.estShipDate}</div>
        </div>
      </div>

      <div>{shippingOption.total === 0 ? "Free" : `$${shippingOption.total}`}</div>
    </div>
  );
};
