import React from "react";

interface OrderHeaderProps {
  orderId: string;
  amount: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ orderId, amount }) => {
  return (
    <header>
      <h2>Order #{orderId}</h2>
      <h3>${amount}</h3>
    </header>
  );
};

export default OrderHeader;
