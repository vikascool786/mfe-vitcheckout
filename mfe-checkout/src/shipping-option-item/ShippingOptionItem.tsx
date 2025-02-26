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
          {
            size === 0 ? null : (
              <RadioButton
                id={shippingOption.id.toString()}
                onChange={onChange}
                checked={shippingOption.isSelected}
              />
            )
          }
          <div className={`shipping-option-sub-container`}>
            <div>{shippingOption.method}</div>
            <div className="shipping-option-estShipDate">
              {shippingOption.estShipDate}
            </div>
          </div>
        </div>

        <div>
          {shippingOption.total === 0 ? "Free" : `${shippingOption.totalStr}`}
        </div>
      </div>
      {hasAutoship && shippingOption.isSelected && (
        <div className="shipping-option-autoship">
          <AutoshipIcon />
          Recurring Autoship orders with ship via Standard Shipping
        </div>
      )}

      {shippingOption.isSelected &&
        shippingOption.method === "@ Market America's Office" && (
          <div className="shipping-option-office">
            <h4 className="shipping-option-office-title">
              Pickup Instructions
            </h4>
            <ul className="shipping-option-office-address">
              <li>
                Orders will be available for pickup the next business day after
                the order has been placed.
              </li>
              <li>
                You will receive an email and/or SMS when your order is ready
                for pickup.
              </li>
              <li>
                Our contactless pickup hours are{" "}
                <strong>9:00 AM - 4:00 PM, Monday - Friday.</strong>
              </li>
              <li>
                Please come to our contract-free pickup area and call{" "}
                <a href="tel:+13364784037">(336) 478-4037</a> when you arrive.
              </li>
              <li>
                The pickup location is the front right glass door at the front
                of the corporate office building - there are signs that will
                direct you.
              </li>
              <li>
                A member of our staff will bring your order(s) outside for you
                to collect.
              </li>
              <li>
                Please sign a copy of your invoice and leave it on the table
                after you check your order.
              </li>
              <li>
                If you have any issues with your order, please call{" "}
                <a href="tel:+13364784037">(336) 478-4037</a>, and a staff
                member will assist you.
              </li>
            </ul>
          </div>
        )}
    </div>
  );
};
