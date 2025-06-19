import React from "react";
import './TotalAmount.scss';
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import { useContentStrings } from "../hooks/useContentStrings";
export const TotalAmount: React.FC<any> = ({ }) => {
    const [order, setOrder] = useAtom(orderAtom);
    const { getString } = useContentStrings();
    return (
        <div className="total-amount__wrapper">
            <div className="total-amount__main">
                <div className="total-amount__label">{getString("total")}</div>
                <div className="total-amount__price">{`${order?.totals?.priceStr}`}</div>
            </div>
        </div>
    );
};
