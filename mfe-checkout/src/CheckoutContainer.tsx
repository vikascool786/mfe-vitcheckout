import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { fetchOrderDetail } from "./api/service/GetOrder";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { shippingData, total } from "./store";

export const CheckoutContainer: React.FC = () => {
  const [, setShippingData] = useAtom(shippingData);
  const [, setTotal] = useAtom(total);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetOrderDetail = async () => {
      try {
        const response = await fetchOrderDetail();
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
          shippingItems: firstStore?.items,
          shippingSelected: firstStore?.shippingMethod
            ? firstStore.shippingMethod
            : "",
        });
        setTotal(firstStore?.totals);
      } catch (error) {
        setError("Failed to fetch data.");
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
