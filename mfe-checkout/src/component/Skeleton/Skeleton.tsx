import React, { useEffect } from "react";
import "./Skeleton.scss";

interface SkeletonProps {}
const Skeleton: React.FC<SkeletonProps> = () => {

    useEffect(() => {
        const event = new Event("CheckoutSkeletonRendered");
        window.dispatchEvent(event);
    }, []);

  return (
    <div className="mfe-checkout-skeleton-container">
      <div className="skeleton-col-1">
        <div className="skeleton-container-small"></div>
        <div className="skeleton-container-middle"></div>
        <div className="skeleton-container-large"></div>
        <div className="skeleton-container-button"></div>
      </div>
      <div className="skeleton-col-2">
        <div className="skeleton-container-middle"></div>
      </div>
    </div>
  );
};
export default Skeleton;
