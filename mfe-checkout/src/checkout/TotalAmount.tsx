import React from "react";
import './TotalAmount.scss';
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import { useContentStrings } from "../hooks/useContentStrings";
import { ShoppingCart } from "../interfaces/ShoppingCart";
interface ICartSummaryProps {
    cartData: ShoppingCart;
}
export const TotalAmount: React.FC<ICartSummaryProps> = ({ cartData }) => {
    const [order, setOrder] = useAtom(orderAtom);
    const price =
        cartData?.shoppingCartData?.totals?.prices?.priceDisplay ??
        order?.totals?.priceStr;
    const { getString } = useContentStrings();
    return (
        <div className="total-amount__wrapper">
            <div className="total-amount__main">
                <div className="total-amount__label">{getString("total")}</div>
                <div className="total-amount__price">{`${price}`}</div>
            </div>
        </div>
    );
};
