import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import "./ShippingOptionItem.scss";
import { AutoshipIcon } from "../assets/icons/Autoship";

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
  hasAutoship: boolean;
}

export const ShippingOptionItem: React.FC<IShippingOptionItem> = ({
  shippingOption,
  isSelected,
  onChange,
  index,
  size,
  hasAutoship,
}) => {
  const select = isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isLast = index === size ? "end" : "";

  return (
    <div className={`shipping-option-container ${select} ${isFirst} ${isLast}`}>
      <div className="shipping-option-wrapper">
        <div className="shipping-option-select-container">
          <RadioButton
              id={shippingOption.id.toString()}
              onChange={onChange}
              checked={shippingOption.isSelected}
          />
          <div className={`shipping-option-sub-container`}>
            <div>{shippingOption.method}</div>
            <div className="shipping-option-estShipDate">{shippingOption.estShipDate}</div>
          </div>
        </div>

        <div>
          {shippingOption.total === 0 ? "Free" : `${shippingOption.totalStr}`}
        </div>
      </div>
      { (hasAutoship && shippingOption.isSelected) && (
          <div className="shipping-option-autoship"><AutoshipIcon />Recurring Autoship orders with ship via Standard Shipping</div>
      )}
    </div>
  );
};
