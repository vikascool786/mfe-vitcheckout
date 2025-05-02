import React from "react";
import "./FormSubTitle.scss";

interface IFormSubTitleProps {
  title: string;
}
export const FormSubTitle: React.FC<IFormSubTitleProps> = ({ title }) => {
  return <div className="form-sub__title">{title}</div>;
};
