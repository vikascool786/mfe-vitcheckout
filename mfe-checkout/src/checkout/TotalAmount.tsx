import React from "react";
import './TotalAmount.scss';
export const TotalAmount: React.FC<any> = () => {
    return (
        <div className="total-amount__wrapper">
            <div className="total-amount__main">
                <div className="total-amount__label">Total</div>
                <div className="total-amount__price">109</div>
            </div>
        </div>
    );
};
