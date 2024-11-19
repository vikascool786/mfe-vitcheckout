import React, { RefObject, useEffect, useRef, useState } from "react";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { fetchOrderDetail } from "./api/service/GetOrder";
import {
  Item,
  ResponseData,
  ShippingSelection,
  Store,
} from "./interfaces/ShippingMethod";

export const CheckoutContainer: React.FC = () => {
  const [orderData, setOrderData] = useState<ResponseData | null>(null);
  
  const [shippingSelections, setShippingSelections] = useState<
    ShippingSelection[] | null
  >(null);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [shippingItems, setShippingItem] = useState<Item[]>();
  const [totals, setTotal] = useState();


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetOrderDetail = async () => {
      try {
        const response = await fetchOrderDetail();
        setOrderData(response);

        const stores = response?.stores;
        console.log(stores);
        const storeKeys = Object.keys(stores);
        if (storeKeys.length === 0) {
          console.error("No stores found");
          return;
        }
        const firstStoreKey = Object.keys(stores)[0];
        const firstStore = stores[firstStoreKey!];
        setShippingSelections(firstStore?.shippingSelections || []);
        setSelectedShipping(
          firstStore?.shippingMethod ? firstStore.shippingMethod : ""
        );
        setShippingItem(firstStore?.items);
        setTotal(firstStore?.totals)
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
        <ShippingMethod
          shippingItems={shippingItems}
          shippingSelections={shippingSelections}
          shippingSelected={selectedShipping}
        />
        <PaymentMethod />
      </div>
      <div>
        <OrderSummary totals={totals}  />
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
