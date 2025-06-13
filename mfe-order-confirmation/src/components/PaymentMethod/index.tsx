import React from 'react';

interface PaymentMethodProps {
  method: string;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ method }) => {
  return (
    <section>
      <h4>Payment Method</h4>
      <p>{method}</p>
    </section>
  );
};

export default PaymentMethod;