import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import { RadioButton } from "../component/RadioButton/RadioButton";

const SHIPPING_OPTIONS = [
  {
    shippingType: "Standard Shipping",
    arrivesIn: "Arrives 10-08-2024",
    price: "$6.00",
    isSelected: true,
  },
  {
    shippingType: "Expedited 3 Day",
    arrivesIn: "Arrives 10-07-2024",
    price: "$15.00",
  },
  {
    shippingType: "Expedited 2 Day",
    arrivesIn: "Arrives 10-06-2024",
    price: "$18.00",
  },
  {
    shippingType: "Overnight",
    arrivesIn: "Arrives 10-07-2024",
    price: "$30.00",
  },
];

const Product = {
  name: "Isotonix Calcium Plus",
  description: "Single Bottle (90 Servings)",
  cashback: "+ $0.52",
  price: "$25.00",
  quantity: 1,
  imageUrl: require("../assets/images/ProductImage.png"),
};

interface ShippingMethodProps {
  shippingSelections: ShippingSelection[] | null;
}

export const ShippingMethod: React.FC<ShippingMethodProps> = ({ shippingSelections }) => {

  const SHIPPING_OPTIONS = shippingSelections
    ? shippingSelections.map((option) => ({
      id: option.id,
      method: option.method,
      price: option.total.toFixed(2),
      estimatedDelivery: option.estShipDate,
    }))
    : [];

  if (!shippingSelections) {
    return <p>Loading shipping methods...</p>;
  }

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className="shipping-item-container">
        <ShippingItem product={Product} />
      </div>

      <div className="shipping-options-container">
        {shippingSelections.map((option) => (
          <div className={`shipping-option-container`} key={option.id}>
            <div className="shipping-option-select-container">

              <div className="radio-wrapper">
                <input className="radio-style" type="radio" />
                <label>{option.method}</label>
              </div>
              <div className={`shipping-option-sub-container`}>
                <div>{option.method}</div>
                <div>{option.estShipDate}</div>
              </div>
            </div>
            <div>{option.total}</div>
          </div>
        ))}
      </div>

      {/* need rework on it  */}
      {/* <ShippingOptions shippingOptions={SHIPPING_OPTIONS} /> */}
    </div>
  );
};
