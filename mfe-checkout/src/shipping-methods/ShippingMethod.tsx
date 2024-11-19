import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { Item, ShippingSelection } from "../interfaces/ShippingMethod";
import { RadioButton } from "../component/RadioButton/RadioButton";

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
  shippingItems: Item[];
  shippingSelected: string;
}

export const ShippingMethod: React.FC<ShippingMethodProps> = ({
  shippingItems,
  shippingSelected,
  shippingSelections,
}) => {
  if (!shippingSelections) {
    return <p>Loading shipping methods...</p>;
  }

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className="shipping-item-container">
        {shippingItems.map((item) => (
          <ShippingItem product={item} />
        ))}
      </div>

      <ShippingOptions
        shippingOptions={shippingSelections}
        shippingSelected={shippingSelected}
      />
    </div>
  );
};
