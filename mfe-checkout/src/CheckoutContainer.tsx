import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { Item, ShippingSelection } from "./interfaces/Order";
import { ITotal } from "./interfaces/ShopperCart";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { checkoutData, orderData, shippingData, total } from "./store";
import { fetchOrderDetail } from "./api/service/GetOrder";

interface ICheckoutContainer {
  shopperId: string;
  cartId: string;
}

export const CheckoutContainer: React.FC<ICheckoutContainer> = ({
  shopperId,
  cartId,
}) => {
  const setShippingData = useSetAtom(shippingData);
  const setTotal = useSetAtom(total);
  const setOrder = useSetAtom(orderData);
  const setCheckout = useSetAtom(checkoutData);
  setCheckout({
    shopperId,
    cartId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetOrderDetail = async () => {
      try {
        const response = await fetchOrderDetail(cartId);
        const stores = response?.stores;
        const storeKeys = Object.keys(stores);
        if (storeKeys.length === 0) {
          console.error("No stores found");
          return;
        }
        const firstStoreKey = Object.keys(stores)[0] as string;
        const firstStore = stores[firstStoreKey!];
        setShippingData({
          shippingSelections: firstStore?.shippingSelections || [],
          shippingItems: firstStore?.items as Item[],
          shippingSelected: firstStore?.shippingSelections.find(
            (selection: ShippingSelection) =>
              selection.method === firstStore.shippingMethod
          ) as ShippingSelection,
        });
        setTotal(response.totals as ITotal);
        setOrder(response);
      } catch (error) {
        // setError("Failed to fetch data.");
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetOrderDetail();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="checkout-sub-container">
        <Checkout />
        <ShippingMethod />
        <PaymentMethod />
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
    //   <div>
    //   <h2>Shipping Methods & Review Items</h2>
    //   {orderData && (
    //     <div>
    //       {Object.entries(orderData.stores).map(([storeId, store]) => (
    //         <div key={storeId}>
    //           <h3>{storeId}</h3>
    //           {/* <h3>{JSON.stringify(store)}</h3> */}
    //           <p>Total Price: ${store.totals?.price}</p>
    //           <ul>
    //             {store.shippingSelections?.map((method) => (
    //               <li key={method.id}>
    //                 {method.method}: ${method.total} - {method.estShipDate}
    //               </li>
    //             ))}
    //           </ul>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
  );
};
