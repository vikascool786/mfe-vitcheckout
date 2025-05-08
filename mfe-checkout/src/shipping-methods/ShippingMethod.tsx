import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  buildOrder,
  OrderResponse,
  removeProductFromCart,
} from "../api/service/Order";

import { portalApiData } from "../checkout/portalAtom";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { RadioButton } from "../component/RadioButton/RadioButton";
import {
  OOS_CONSOLIDATE_CODE,
  OOS_CONSOLIDATE_SPLIT_CODE,
  OrderConsolidationData,
} from "../interfaces/OrderConsolidationData";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import {
  initialPaymentMethods,
  loadingAtom,
  orderAtom,
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {
  getCatalogName,
  getShipWarningMessage,
} from "../utils/helpers/GetCatalog";
import {
  getOrderConsolidateData,
  getOrderNotifications,
} from "../utils/OrderUtils";
import { GET_SHOP_CART_URL } from "../utils/urlResolver";
import "./ShippingMethod.scss";
import { decodeHtmlEntities } from "../utils/helpers/DecodeHtml";
import { Warning } from "../assets/svgs/Warning";
import { setDataObjectProperty } from "../utils/helpers/SetDataObjectProperty";
import { Spinner } from "../component/Spinner/Spinner";
import { FreeShipMessage } from "./FreeShipMessage";
import StoreHeading from "../component/StoreHeading";
import { OrderStore } from "../interfaces/Order";
import { isGiftCardStore, storeHasCustomCocktail, storeHasOOSItems } from "../utils/StoreUtils";
import {isPaypalPayment, PAYPAL, PAYPAL_RECURRING} from "../payment-method/PaymentType";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import { Address } from "../interfaces/Address";
import PaypalIcon from "../assets/images/PayPal.png";
import SezzleIcon from "../assets/images/Sezzle.png";
import { getFreeShipMessagesForOrder } from "../utils/FreeShipMessageUtil";

interface IShippingMethodProps {
  shopperID: string;
  isAddressSaved: boolean;
}

const ShippingMethod: React.FC<IShippingMethodProps> = ({
  shopperID,
  isAddressSaved,
}) => {
  const [orders, setOrder] = useAtom(orderAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [portalData] = useAtom(portalApiData(shopperID));
  const [orderConsolidateData, setOrderConsolidateData] =
    useState<OrderConsolidationData>({
      showOrderConsolidate: false,
      availabilityDate: "",
      oosConsolidate: OOS_CONSOLIDATE_CODE,
      shipDateMessageMap: new Map<string, string>(),
    });
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const [orderNotifications, setOrderNotifications] = useAtom(
    orderNotificationsAtom
  );
  const [freeShipMessageMap, setFreeShipMessageMap] = useState(new Map<string, string>());

  if (!orders) {
    return <p>Loading shipping methods...</p>;
  }

  const setOrderInDataObject = () => {
    const prodContainerId: string[] = [];
    const mybuysCartItems: Array<{ sku: string; qty: string; price: string }> =
      [];
    const [items] = Object.entries(orders?.stores).map(
      ([key, store]) => store.items
    );

    for (const [key, store] of Object.entries(orders?.stores)) {
      store.items.forEach((item) => {
        mybuysCartItems.push({
          sku: `${item.prodId}-${item.catalogSku}`,
          qty: item.quantity.toString(),
          price: item.totals.price.toString(),
        });
        prodContainerId.push(item.prodContainerId);
      });
    }
    setDataObjectProperty("prodContainerId", prodContainerId.join(","));
    setDataObjectProperty("mybuysCartItems", mybuysCartItems);
  };

  const handleRemoveProduct = async (storeKey: string, itemKey: string) => {
    try {
      setLoading(true);

      // Remove item from the store
      const updatedStores = { ...orders.stores };
      if (!updatedStores[storeKey]) {
        return;
      }

      const itemToRemove = updatedStores[storeKey].items.find(
        (item) => item.product_hash === itemKey
      );

      if (!itemToRemove) {
        return;
      }

      updatedStores[storeKey].items = updatedStores[storeKey].items.filter(
        (item) => item.product_hash !== itemKey
      );

      if (updatedStores[storeKey].items.length === 0) {
        delete updatedStores[storeKey];
      }

      const updatedOrder = {
        ...orders,
        stores: updatedStores,
      };

      await removeProductFromCart(orders.id, itemKey);

      const orderConsolidateData = getOrderConsolidateData(orders);
      // send oosConsolidate when current oosConsolidate is split and showOrderConsolidate is true
      const isOOSConsolidateSplit =
        orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE &&
        orderConsolidateData.showOrderConsolidate;

      const response = await buildOrder(
        generateChangeStoreResponse({
          ...updatedOrder,
          userOptions: {
            ...updatedOrder.userOptions,
            oosConsolidate: isOOSConsolidateSplit
              ? OOS_CONSOLIDATE_SPLIT_CODE
              : OOS_CONSOLIDATE_CODE,
          },
        })
      );

      if (response.response.errors) {
        window.location.href = GET_SHOP_CART_URL();
        return;
      }

      const orderData = response.response.success.data;
      // add paypal back if it exists in the payment methods

      const shouldShowPaypal = orderData?.paymentMethods.some(
        (method) => isPaypalPayment(method.typeID)
      );

      if (shouldShowPaypal) {
        const isPaypalRecurring = orderData?.paymentMethods.some(
            (method) =>
                method.typeID === PAYPAL_RECURRING.typeId
        );

        const paypalPayment =
            initialPaymentMethods.find(
                (method) => method.paymentMethod.typeID === (isPaypalRecurring ? PAYPAL_RECURRING.typeId : PAYPAL.typeId)
            ) || null;

        const sezzleIndex = paymentMethods.findIndex(
          (method) =>
            method.paymentMethod.accountName.toLowerCase() === "sezzle"
        );

        const updatedPaymentMethods = [...paymentMethods];

        // Remove existing PayPal if present
        const existingPayPalIndex = updatedPaymentMethods.findIndex(
          (method) =>
            isPaypalPayment(method.paymentMethod.typeID)
        );

        if (existingPayPalIndex > -1) {
          updatedPaymentMethods.splice(existingPayPalIndex, 1);
        }

        if (sezzleIndex > -1) {
          // Find new Sezzle index after PayPal removal
          const newSezzleIndex = updatedPaymentMethods.findIndex(
            (method) =>
              method.paymentMethod.accountName.toLowerCase() === "sezzle"
          );

          // Determine the index for inserting PayPal
          const insertIndex =
            updatedPaymentMethods.length > 1
              ? Math.max(newSezzleIndex - 1, updatedPaymentMethods.length - 1)
              : 1;

          if(paypalPayment){
            updatedPaymentMethods.splice(insertIndex, 0, paypalPayment);
          }
        } else {
          if(paypalPayment){
            updatedPaymentMethods.push(paypalPayment);
          }
        }

        setPaymentMethods(updatedPaymentMethods);
      }
      setOrder(response.response.success.data);

      setOrderNotifications(getOrderNotifications(response.response.success));
    } catch (error) {
      console.error("Error removing product:", error);
    } finally {
      setLoading(false);
    }
  };

  const showShippingOptions = (store: OrderStore): boolean => {
    return store.shippingSelections && !isGiftCardStore(store);
  };

  useEffect(() => {
    setOrderConsolidateData(getOrderConsolidateData(orders));
    setOrderInDataObject();
  }, [orders]);

  useEffect(() => {
    const fetchFreeShipMessages = async () => {
      if (!orders) return;

      try {
        const messages = await getFreeShipMessagesForOrder(orders, portalData);
        setFreeShipMessageMap(messages);
      } catch (error) {
        console.error("Failed to fetch free shipping messages", error);
      }
    };

    fetchFreeShipMessages();
  }, [orders]);

  const getShipFreeMessageForStore = (
      store: OrderStore,
      storeKey: string,
  )=> {
    //shipping calc does not work with OOS prods or custom cocktail
    if(storeHasOOSItems(store) || storeHasCustomCocktail(store)){
      return "";
    }
    return freeShipMessageMap.get(store?.store?.catalogId.toString()) || ""
  }

  const handleChangeOOSConsolidate = (
    oosConsolidate: number,
  ) => {
    setLoading(true);
    setOrderConsolidateData((prev) => ({
      ...prev,
      oosConsolidate: oosConsolidate,
    }));

    if (orders) {
      const newOrder = buildOrder(
        generateChangeStoreResponse({
          ...orders,
          userOptions: {
            ...orders.userOptions,
            oosConsolidate: oosConsolidate,
          },
        })
      );
      newOrder
        .then((orderResponse: OrderResponse) => {
          setOrder(orderResponse.response.success.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods" />
      {isAddressSaved && orderConsolidateData?.showOrderConsolidate && (
        <div className="shipping-options-container">
          <div
            className={`shipping-option-container start ${orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE
                ? "selected"
                : ""
              }`}
              onClick={() => handleChangeOOSConsolidate(OOS_CONSOLIDATE_SPLIT_CODE)}
          >
            <div className="shipping-option-wrapper">
              <div className="shipping-option-select-container">
                <RadioButton
                  id={"2"}
                  onChange={(e) =>
                    handleChangeOOSConsolidate(OOS_CONSOLIDATE_SPLIT_CODE, e)
                  }
                  checked={
                    orderConsolidateData.oosConsolidate ===
                    OOS_CONSOLIDATE_SPLIT_CODE
                  }
                  onClick={(e) => e.stopPropagation()} // Prevent triggering div click
                />
                <div className={`shipping-option-sub-container`}>
                  <div>
                    Ship available products now and create multiple shipments
                  </div>
                  <div>Separate shipping charges apply.</div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`shipping-option-container end ${orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_CODE
                ? "selected"
                : ""
              }`}
              onClick={() => handleChangeOOSConsolidate(OOS_CONSOLIDATE_CODE)}
          >
            <div className="shipping-option-wrapper">
              <div className="shipping-option-select-container">
                <RadioButton
                  id={"3"}
                  onChange={(e) =>
                    handleChangeOOSConsolidate(OOS_CONSOLIDATE_CODE, e)
                  }
                  checked={
                    orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_CODE
                  }
                  onClick={(e) => e.stopPropagation()} // Prevent triggering div click
                />
                <div className={`shipping-option-sub-container`}>
                  <div>Wait and ship together. Save on shipping.</div>
                  <div>Ships on {orderConsolidateData?.availabilityDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {orders?.stores && (
        <div className="qa-shipping-item shipping-item-container">
          {Object.entries(orders?.stores)
            .sort(([, storeA], [, storeB]) => {
              return (storeB?.store?.isMA ?? 0) - (storeA?.store?.isMA ?? 0);
            })
            .map(([key, store]) => {
              return (
                store && (
                  <div key={key}>
                    <FreeShipMessage
                        freeShipMessage={getShipFreeMessageForStore(store, key)}
                    />
                    <StoreHeading
                      qaTag={"qa-catalog"}
                      storeName={getCatalogName(store) || ""}
                      storeKey={key}
                      isMAStore={store.store?.isMA === 1}
                      order={orders}
                      isOrderSummary={false}
                    />

                    {isGiftCardStore(store) && (
                      <div className="shipping-email-delivery">
                        {store?.store?.isMA
                          ? "Email Delivery - Within 5 minutes"
                          : "Email Delivery"}
                      </div>
                    )}

                    {store.items &&
                      store.items.map((item, itemIndex) => (
                        <div key={`${item.product_hash}-${itemIndex}`}>
                          <ShippingItem
                            item={item}
                            storeDetail={store?.store}
                            total={store?.totals}
                            onRemove={handleRemoveProduct}
                            storeKey={key}
                            portalData={portalData}
                            isMaProduct={store?.store?.isMA === 1}
                            cartId={orders.id}
                            isAddressSaved={isAddressSaved}
                          />
                        </div>
                      ))}
                    {/* Pass store-specific shippingSelections */}

                    {getShipWarningMessage(store) && (
                      <div className="warning-message">
                        <Warning />
                        <span
                          className="warning-span"
                          dangerouslySetInnerHTML={{
                            __html: getShipWarningMessage(store) as string,
                          }}
                        />
                      </div>
                    )}
                    {isAddressSaved && showShippingOptions(store) && (
                      <ShippingOptions store={store} storeKey={key} />
                    )}
                  </div>
                )
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ShippingMethod;
