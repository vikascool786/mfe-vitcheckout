import React from "react";
import { Button } from "../../component/Button/Button";
import "./PlaceOrder.scss";

interface IPlaceOrder {
  confirmOrder: () => void;
}

export const PlaceOrder: React.FC<IPlaceOrder> = ({ confirmOrder }) => {
  return (
    <div className="checkout-place-order">
      <div className="checkout-place-order-text">
        By clicking place order, you agree to the SHOP.COM Terms of Use and
        Privacy Policy.
      </div>
      <Button label="Place Order" type="primary" onClick={confirmOrder} />
    </div>
  );
};
