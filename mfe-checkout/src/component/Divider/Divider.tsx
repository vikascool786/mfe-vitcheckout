import React from 'react'
import "./Divider.scss";

interface DividerProps {
    content: string;
}
const Divider: React.FC<DividerProps> =   ({
    content
}) => {
  return (<div className="mfe-divider">
    <hr />
    <span>{content}</span>
  </div>)
};
export default Divider;