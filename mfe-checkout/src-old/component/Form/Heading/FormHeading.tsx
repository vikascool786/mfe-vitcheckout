import React from "react";
import "./FormHeading.scss";

interface IFormHeadingProps {
  title: string;
}
export const FormHeading: React.FC<IFormHeadingProps> = ({ title }) => {
  return <div className="heading">{title}</div>;
};
