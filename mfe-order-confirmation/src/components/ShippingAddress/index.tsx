import React from 'react';

interface AddressProps {
  name: string;
  address: string;
  cityStateZip: string;
  phone: string;
}

const ShippingAddress: React.FC<AddressProps> = ({
  name,
  address,
  cityStateZip,
  phone,
}) => {
  return (
    <section>
      <h4>Shipping Address</h4>
      <p>{name}</p>
      <p>{address}</p>
      <p>{cityStateZip}</p>
      <p>{phone}</p>
    </section>
  );
};

export default ShippingAddress;