import React from "react";
import "./styles.css";

interface OrderHeaderProps {
  orderId: string;
  amount: string;
  deliveryDate: string;
  email: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderId,
  amount,
  deliveryDate,
  email,
}) => {
  return (
    <section className="order-header" style={{
      textAlign: "center",
      backgroundColor: "#f8f8f8",
      padding: "1.5rem",
    }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
        Order #{orderId}
      </h2>
      <h3 style={{ fontSize: "1.25rem", color: "#2e7d32", fontWeight: "bold", margin: 0 }}>
        ${amount}
      </h3>
      <p style={{ marginTop: "0.75rem", fontWeight: 500 }}>
        Estimated Delivery Date {deliveryDate}
      </p>
      <p style={{ marginBottom: "0.25rem" }}>We sent a confirmation email to {email}</p>
      <a href="#" style={{ color: "purple", textDecoration: "underline", fontSize: "0.9rem" }}>
        Print Order Confirmation
      </a>
    </section>
  );
};

export default OrderHeader;
