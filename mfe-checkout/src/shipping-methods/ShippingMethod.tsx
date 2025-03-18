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
import withLoader from "../hoc/withLoader";
import {
  OOS_CONSOLIDATE_CODE,
  OOS_CONSOLIDATE_SPLIT_CODE,
  OrderConsolidationData,
} from "../interfaces/OrderConsolidationData";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import {
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
import { isGiftCardStore } from "../utils/StoreUtils";
import { PAYPAL } from "../payment-method/PaymentType";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import { Address } from "../interfaces/Address";
import PaypalIcon from "../assets/images/PayPal.png";
import SezzleIcon from "../assets/images/Sezzle.png";

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

      const response = await buildOrder(
        generateChangeStoreResponse(updatedOrder)
      );

      if (response.response.errors) {
        window.location.href = GET_SHOP_CART_URL();
        return;
      }

      const orderData = response.response.success.data;
      // add paypal back if it exists in the payment methods

      const shouldShowPaypal = orderData?.paymentMethods.some(
        (method) => method.type.toLowerCase() === PAYPAL.name.toLowerCase()
      );

      if (shouldShowPaypal) {
        const sezzleIndex = paymentMethods.findIndex(
          (method) =>
            method.paymentMethod.accountName.toLowerCase() === "sezzle"
        );

        const updatedPaymentMethods = [...paymentMethods];

        // Remove existing PayPal if present
        const existingPayPalIndex = updatedPaymentMethods.findIndex(
          (method) =>
            method.paymentMethod.accountName.toLowerCase() === "paypal"
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

          updatedPaymentMethods.splice(insertIndex, 0, {
            paymentMethod: createPaymentMethod({
              accountName: PAYPAL.name,
              typeID: PAYPAL.typeId,
              imageUrl: PaypalIcon,
              id: -1001,
            }),
            paymentAddress: {} as Address,
            isPaymentValidated: false,
            isSelected: false,
            isVisible: true,
          });
        } else {
          updatedPaymentMethods.push({
            paymentMethod: createPaymentMethod({
              accountName: PAYPAL.name,
              typeID: PAYPAL.typeId,
              imageUrl: PaypalIcon,
              id: -1001,
            }),
            paymentAddress: {} as Address,
            isPaymentValidated: false,
            isSelected: false,
            isVisible: true,
          });
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

  const handleChangeOOSConsolidate = (
    oosConsolidate: number,
    event: React.ChangeEvent<HTMLInputElement>
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
      <FormHeading title="Shipping Methods & Review Items" />
      {isAddressSaved && orderConsolidateData?.showOrderConsolidate && (
        <div className="shipping-options-container">
          <div
            className={`shipping-option-container start ${
              orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_SPLIT_CODE
                ? "selected"
                : ""
            }`}
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
            className={`shipping-option-container end ${
              orderConsolidateData.oosConsolidate === OOS_CONSOLIDATE_CODE
                ? "selected"
                : ""
            }`}
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
                      orderStore={store}
                      portalData={portalData}
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
