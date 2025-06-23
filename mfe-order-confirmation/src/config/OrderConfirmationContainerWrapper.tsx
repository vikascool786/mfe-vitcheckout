import React from "react";

const CheckoutContainerWrapper = (appConfig: {
  cartId: string;
  shopperId: string;
  siteId: string;
  pcid: string;
  sessionId: string;
}) => {
  return (
    <div className="checkout-container-wrapper">
      <div style={{ border: "2px solid green", padding: "20px" }}>
        Checking visibility
      </div>
    </div>
  );
};

export default CheckoutContainerWrapper;
