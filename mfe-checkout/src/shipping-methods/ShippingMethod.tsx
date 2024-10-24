import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";

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

interface IShippingMethodProps {}

export const ShippingMethod = () => {
  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className="shipping-item-container">
        <ShippingItem product={Product} />
      </div>

      <ShippingOptions shippingOptions={SHIPPING_OPTIONS} />
    </div>
  );
};
