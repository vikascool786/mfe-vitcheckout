import React from 'react'
import { FormHeading } from "../component/Form/Heading/FormHeading";
import "./ShippingMethod.scss";
import { ShippingItem } from '../shipping-item/ShippingItem';

const Product = {
  name: "Isotonix Calcium Plus",
  description: "Single Bottle (90 Servings)",
  cashback: "+ $0.52 Cashback",
  price: "$25.00",
  quantity: 1,
  imageUrl: require('../assets/images/ProductImage.png')
}

interface IShippingMethodProps {}

export const ShippingMethod = () => {
  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className='shipping-item-container'>
        <ShippingItem product={Product} />
      </div>
    </div>
  );
};
