import React from 'react';

interface SummaryProps {
  subtotal: string;
  tax: string;
  shipping: string;
  cashback: string;
  total: string;
}

const OrderSummary: React.FC<SummaryProps> = ({
  subtotal,
  tax,
  shipping,
  cashback,
  total,
}) => {
  return (
    <section>
      <h4>Order Summary</h4>
      <p>Subtotal: {subtotal}</p>
      <p>Tax: {tax}</p>
      <p>Standard Shipping: {shipping}</p>
      <p>VIFT Cashback: -{cashback}</p>
      <p><strong>Order Total: {total}</strong></p>
    </section>
  );
};

export default OrderSummary;