import React, { useEffect } from "react";
import { Button } from "../../component/Button/Button";
import "./OrderConfirmation.scss";
import { ShippingItem } from "../../shipping-item/ShippingItem";
import { Item } from "../../interfaces/Order";
import { FormField } from "../../component/Form/Field/FormField";
import { OrderSummary } from "../../order-summary/OrderSummary";
import { useSetAtom } from "jotai";
import { orderAtom } from "../../store";
import { ORDER_DATA } from "../../utils/MOCKS";
import { getCatalogName } from "../../utils/helpers/GetCatalog";
import { Cashback } from "../../assets/svgs/Cashback";

interface IOrderConfirmation {
  products: Item[];
  shippingAddress: string[];
}

export const OrderConfirmation: React.FC<IOrderConfirmation> = ({
  products,
  shippingAddress,
}) => {
  const setOrder = useSetAtom(orderAtom);

  const order = ORDER_DATA;

  useEffect(() => {
    setOrder(ORDER_DATA);
  }, []);

  const storesTotals =
    ORDER_DATA?.stores &&
    Object.entries(ORDER_DATA?.stores).map(([key, store], index) => {
      return store;
    });

  return (
    <div className="oc-container">
      <div className="oc-order-container">
        <div className="oc-order">
          <span className="oc-order-main-text">Thanks for your order!</span>
          <span className="oc-order-sub-text">
            We have sent an order confirmation to your email address.
          </span>
          <span className="oc-order-sub-text">Order number: #1235378422</span>
        </div>
        <Button label="Print Order Confirmation" type="secondary" />
      </div>
      <div className="oc-grid">
        <div className="oc-grid-left">
          <div className="oc-box-container">
            <span>Order Summary</span>
            {products.map((product) => (
              <ShippingItem item={product} />
            ))}
          </div>
          <div className="oc-box-container">
            <span>Shipping Summary</span>
            {shippingAddress.map((address) => (
              <div>{address}</div>
            ))}
          </div>
          <div className="oc-box-container">
            <span>Want to provide feedback</span>

            <div>We are constantly looking for ways to improve.</div>
            <FormField />
            <Button label="Submit Feedback" type="secondary" />
          </div>
        </div>

        <div className="oc-grid-right">
          <div className="oc-box-container">
            <span>Billing Summary</span>
            <div>
              <span>Payment Method{'\n'}</span>
              <span>Mastercard 0469</span>

              <div>
                {storesTotals &&
                  storesTotals.map((store, index) => {
                    const isFirst = index === 0;
                    const isLast = index === storesTotals.length - 1; // Fix the condition for the last element
                    return (
                      <div
                        className={`order-charges-table ${
                          isFirst ? "order-charges-table-first" : ""
                        } ${isLast ? "order-charges-table-last" : ""}`}
                        key={store.id || index} // Add a key for the mapped elements
                      >
                        <div className="shipping-catolog-name">
                          {getCatalogName(store)}
                        </div>
                        <div className="order-summary-row">
                          <div>Items Subtotal</div>
                          <div>${store?.totals.price}</div>
                        </div>
                        <div className="order-summary-row">
                          <div>Tax Total</div>
                          <div>${store?.totals.tax}</div>
                        </div>

                        <div className="order-summary-row">
                          <div>Shipping</div>
                          <div>${store?.totals.shipping}</div>
                        </div>
                      </div>
                    );
                  })}

                <div className="order-summary-total">
                  <div>Total Due</div>
                  <div>${order?.totals?.price}</div>
                </div>

                {order?.totals?.cashBack && (
                  <div className="order-summary-cashback-container">
                    <div className="order-cashback">
                      <Cashback />
                      VIFT Cashback earned in this order
                    </div>
                    <div>{`$${order.totals.cashBack}`}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
