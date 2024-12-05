import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { fetchOrderDetail } from "./api/service/GetOrder";
import "./App.scss";
import { Checkout } from "./checkout/Checkout";
import { Item, ShippingSelection } from "./interfaces/Order";
import { ITotal } from "./interfaces/ShopperCart";
import { OrderSummary } from "./order-summary/OrderSummary";
import { PaymentMethod } from "./payment-method/PaymentMethods";
import { ShippingMethod } from "./shipping-methods/ShippingMethod";
import { checkoutData, orderData, shippingData, total } from "./store";

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
        setOrder(response);
        // const response = {
        //   orderId: -1,
        //   email: "kk20241029-02@yopmail.com",
        //   shippingAddress: {
        //     id: 23186477,
        //     description: "test, usa, chicago",
        //     first: "usa",
        //     last: "test",
        //     address1: "123 main",
        //     address2: "",
        //     address3: "",
        //     address4: "",
        //     address5: "",
        //     address6: "",
        //     address7: "",
        //     city: "chicago",
        //     state: "IL",
        //     country: "United States",
        //     isoalpha3Code: "USA",
        //     region: "",
        //     zip: "60645",
        //     phone: "7735551212",
        //     isPoBox: false,
        //   },
        //   billingAddress: {
        //     id: 23186477,
        //     description: "test, usa, chicago",
        //     first: "usa",
        //     last: "test",
        //     address1: "123 main",
        //     address2: "",
        //     address3: "",
        //     address4: "",
        //     address5: "",
        //     address6: "",
        //     address7: "",
        //     city: "chicago",
        //     state: "IL",
        //     country: "United States",
        //     isoalpha3Code: "USA",
        //     region: "",
        //     zip: "60645",
        //     phone: "7735551212",
        //     isPoBox: false,
        //   },
        //   paymentMethod: {
        //     id: 99297082,
        //     number: "491891******5005",
        //     type: "Visa",
        //     html: '<img src="https://img.shop.com/Image/local/images/cc/visa.jpg" alt="Visa" align="middle">',
        //     token: "8206a9b9-e8fd-11df-b64c-005056842e7d",
        //     accountName: "KK",
        //     mask: "491891******5005",
        //     expMonth: 1,
        //     expYear: 2026,
        //     typeID: 9,
        //   },
        //   id: "cart_1182228987_W_USA_USA_ENG",
        //   stores: {
        //     "108567": {
        //       totals: {
        //         price: 48.99,
        //         cashBack: 2.94,
        //         bv: 0.0,
        //         ibv: 1.96,
        //       },
        //       items: [
        //         {
        //           prodId: "1825001247",
        //           image: {
        //             url: "https://img.shop.com/Image/250000/259100/259190/products/1855205799.jpg?size=100x100",
        //           },
        //           caption:
        //             "Sonic the Hedgehog Red Running Shoes Plush Cosplay Slippers | One Size",
        //           catalogSku: "GEE-74771-C",
        //           catalogName: "Toynk",
        //           specialFormula: "0",
        //           quantity: 1,
        //           option: [],
        //           totals: {
        //             price: 48.99,
        //             cashBack: 2.94,
        //             bv: 0.0,
        //             ibv: 1.96,
        //           },
        //         },
        //       ],
        //       shippingSelections: [
        //         {
        //           id: 1,
        //           method: "Standard",
        //           total: 0.0,
        //           estShipDate: "10-7 business days",
        //         },
        //         {
        //           id: 3,
        //           method: "Next Day",
        //           total: 44.99,
        //           estShipDate: "3-2 business days",
        //         },
        //         {
        //           id: 4,
        //           method: "2 Day",
        //           total: 25.99,
        //           estShipDate: "4-3 business days",
        //         },
        //         {
        //           id: 5,
        //           method: "Express",
        //           total: 15.99,
        //           estShipDate: "6-4 business days",
        //         },
        //       ],
        //       shippingMethod: "Standard",
        //     },
        //     "101062-IN_STOCK": {
        //       shippingMethod: "",
        //       deliveryMessage: "",
        //     },
        //   },
        //   totals: {
        //     price: 48.99,
        //     cashBack: 2.94,
        //     bv: 0.0,
        //     ibv: 1.96,
        //   },
        //   paymentMethods: [
        //     {
        //       typeID: 1,
        //       type: "American Express",
        //       categoryID: 1,
        //       visible: true,
        //       supportedForAutoship: true,
        //       imageTag: "^imageserver/local/images/cc/amex.svg",
        //     },
        //     {
        //       typeID: 60,
        //       type: "C2P",
        //       categoryID: 1,
        //       visible: false,
        //       supportedForAutoship: true,
        //       imageTag: "^imageserver/local/images/cc/c2p.svg",
        //     },
        //     {
        //       typeID: 6,
        //       type: "MasterCard",
        //       categoryID: 1,
        //       visible: true,
        //       supportedForAutoship: true,
        //       imageTag: "^imageserver/local/images/cc/mastercard.svg",
        //     },
        //     {
        //       typeID: 9,
        //       type: "Visa",
        //       categoryID: 1,
        //       visible: true,
        //       supportedForAutoship: true,
        //       imageTag: "^imageserver/local/images/cc/visa.svg",
        //     },
        //     {
        //       typeID: 31,
        //       type: "PayPal",
        //       categoryID: 7,
        //       visible: false,
        //       imageTag: "^imageserver/local/images/cc/paypal.svg",
        //     },
        //     {
        //       typeID: 48,
        //       type: "Paypal Auth",
        //       categoryID: 7,
        //       visible: false,
        //       imageTag: "^imageserver/local/images/cc/paypal.svg",
        //     },
        //     {
        //       typeID: 49,
        //       type: "Paypal Credit",
        //       categoryID: 7,
        //       visible: false,
        //       imageTag: "^imageserver/local/images/cc/ppc-acceptance-small.svg",
        //     },
        //     {
        //       typeID: 58,
        //       type: "Paypal Recurring",
        //       categoryID: 7,
        //       visible: false,
        //       supportedForAutoship: true,
        //       imageTag: "^imageserver/local/images/cc/paypal.svg",
        //     },
        //   ],
        //   userOptions: {
        //     applyCashback: false,
        //     applyEWallet: false,
        //     isOfAge: false,
        //     trackingId: "",
        //     deliveryDate: "",
        //     deliveryTime: 1234567890,
        //     signatureRequired: false,
        //     oosConsolidate: false,
        //     userSessionId: "",
        //   },
        // };
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
        console.log("RESPONSE", response)
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
