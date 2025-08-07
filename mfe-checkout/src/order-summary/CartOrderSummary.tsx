import React from "react";
import { GET_API_MODE } from "../utils/helpers/urlResolvers";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ShoppingCart } from "../interfaces/ShoppingCart";
import "./OrderSummary.scss";

interface ICartSummaryProps {
    cartData: ShoppingCart;
}

export const CartOrderSummary: React.FC<ICartSummaryProps> = ({
        cartData
    }) => {
    const apiMode = GET_API_MODE();

    return (
        <div className="order-summary-cart-container">
            <div
                className={`qa-order-summary order-summary-container ${
                    apiMode === "localhost" ? "height-180" : "height-245"
                }`}
            >
                <FormHeading title="Order Summary"/>
                <div className="order-charges-table">
                    <div className="order-summary-row">
                        <div className="order-summary-row">Items Subtotal</div>
                        <div className={"qa-sub-totaltotal"}>
                            {cartData?.shoppingCartData?.totals?.prices?.priceDisplay}
                        </div>
                    </div>
                    <div className="order-summary-row order-summary-cart-container__shipping">
                        <div className="order-summary-row">Shipping</div>
                        <div className={"qa-sub-shipping order-summary-cart-container__shipping--light"}>
                            Enter email and shipping address
                        </div>
                    </div>
                </div>
                <div className="order-charges-table">
                    <div className="order-summary-total">
                        <div className="order-summary__total-d">Estimated Total</div>
                        <div className="order-summary__total-m">Total</div>
                        <div className={"qa-total"}>{cartData?.shoppingCartData?.totals?.prices?.priceDisplay}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
