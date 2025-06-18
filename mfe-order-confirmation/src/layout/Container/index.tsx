import React, { ReactNode } from "react";
import "./styles.css";
interface ContainerProps {
  left: ReactNode;
  right: ReactNode;
}

const Container = ({ left, right }: ContainerProps) => {
  return (
    <div className="container-fluid layout-grid">
      <div className="left-column">{left}</div>
      <div className="right-column">{right}</div>
    </div>
  );
};

export default Container;
