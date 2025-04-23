import React from "react";
import './TotalAmount.scss';
import { useAtom } from "jotai";
import { orderAtom } from "../store";
export const TotalAmount: React.FC<any> = ({ }) => {
    const [order, setOrder] = useAtom(orderAtom);

    return (
        <div className="total-amount__wrapper">
            <div className="total-amount__main">
                <div className="total-amount__label">Total</div>
                <div className="total-amount__price">{`${order?.totals?.priceStr}`}</div>
            </div>
        </div>
    );
};
