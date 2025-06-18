import React, { ReactNode } from "react";
import "./styles.css";

interface SectionCardProps {
  title: string;
  rightText?: string;
  children: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, rightText, children }) => {
  return (
    <div className="section-card-wrapper">
      <div className="section-card-header">
        <h3>{title}</h3>
        {rightText && <span>{rightText}</span>}
      </div>
      <section className="section-card-body">{children}</section>
    </div>
  );
};

export default SectionCard;