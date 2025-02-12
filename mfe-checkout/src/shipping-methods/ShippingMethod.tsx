import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { buildOrder, OrderResponse, removeProductFromCart } from "../api/service/Order";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import withLoader from "../hoc/withLoader";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import {loadingAtom, orderAtom, orderNotificationsAtom} from "../store";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import "./ShippingMethod.scss";
import { portalApiData } from "../checkout/portalAtom";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {getOrderConsolidateData, getOrderNotifications} from "../utils/OrderUtils";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { OrderConsolidationData } from "../interfaces/OrderConsolidationData";
import { OrderStore } from "../interfaces/Order";
import { GET_SHOP_CART_URL } from "../utils/urlResolver";

interface IShippingMethodProps {
  shopperID: string;
}

const ShippingMethod: React.FC<IShippingMethodProps> = ({ shopperID }) => {
  const [orders, setOrder] = useAtom(orderAtom);
  const setLoading = useSetAtom(loadingAtom);
  const [portalData] = useAtom(portalApiData(shopperID));
  const [orderConsolidateData, setOrderConsolidateData] = useState<OrderConsolidationData>({
    showOrderConsolidate: false,
    availabilityDate: "",
    oosConsolidate: 3,
    shipDateMessageMap: new Map<string, string>(),
  });
  const [orderNotifications, setOrderNotifications] = useAtom(orderNotificationsAtom);

  if (!orders) {
    return <p>Loading shipping methods...</p>;
  }

  const handleRemoveProduct = (storeKey: string, itemKey: string) => {
    setLoading(true);
    // Remove item from the store
    const updatedStores = { ...orders.stores };
    if (!updatedStores[storeKey]) {
      return;
    }
    updatedStores[storeKey].items = updatedStores[storeKey].items.filter(
      (item) => item.product_hash !== itemKey
    );

    // Update the order atom, if the store is empty, remove the store
    if (updatedStores[storeKey].items.length === 0) {
      delete updatedStores[storeKey];
    }

    setOrder({
      ...orders,
      stores: updatedStores,
    });

    removeProductFromCart(orders.id, itemKey).then(() => {
      buildOrder(
        generateChangeStoreResponse({
          ...orders,
          stores: updatedStores,
        })
      ).then((response) => {
        if (response.response.errors) {
          window.location.href = GET_SHOP_CART_URL();
        }
        setOrder(response.response.success.data);
        setOrderNotifications(getOrderNotifications(response.response.success));
      });
    });
    setLoading(false);
  };

  useEffect(() => {
    setOrderConsolidateData(getOrderConsolidateData(orders));
  }, [orders]);

  const handleChangeOOSConsolidate = (oosConsolidate: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setOrderConsolidateData(prev => ({
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

      {orderConsolidateData?.showOrderConsolidate && (
        <div className="shipping-options-container">
          <div className={`shipping-option-container start ${orderConsolidateData.oosConsolidate === 2 ? "selected" : ""}`}>
            <div className="shipping-option-wrapper">
              <div className="shipping-option-select-container">
                <RadioButton
                  id={"2"}
                  onChange={(e) => handleChangeOOSConsolidate(2, e)}
                  checked={orderConsolidateData.oosConsolidate === 2}
                />
                <div className={`shipping-option-sub-container`}>
                  <div>Ship available products now and create multiple shipments</div>
                  <div>Separate shipping charges apply.</div>
                </div>
              </div>
            </div>
          </div>
          <div className={`shipping-option-container end ${orderConsolidateData.oosConsolidate === 3 ? "selected" : ""}`}>
            <div className="shipping-option-wrapper">
              <div className="shipping-option-select-container">
                <RadioButton
                  id={"3"}
                  onChange={(e) => handleChangeOOSConsolidate(3, e)}
                  checked={orderConsolidateData.oosConsolidate === 3}
                />
                <div className={`shipping-option-sub-container`}>
                  <div>Wait and ship together. Save on shipping.</div>
                  <div>Ships on {orderConsolidateData?.availabilityDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {orders?.stores && (
        <div className="shipping-item-container">
          {Object.entries(orders?.stores)
            .reverse()
            .map(([key, store]) => {
              return (
                store && (
                  <div key={key}>
                    <div className="shipping-catolog-name">
                      {
                        orderConsolidateData?.oosConsolidate === 2 ? (
                          key.includes("*OOS*") ? (
                            <span>{orderConsolidateData?.shipDateMessageMap.get(key)}</span>
                          ) : (
                            <span>Shipping Now</span>
                          )
                        ) : (
                          <span>{getCatalogName(store)}</span>
                        )
                      }

                    </div>
                    {store.items &&
                      store.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <ShippingItem
                            item={item}
                            storeDetail={store?.store}
                            total={store?.totals}
                            onRemove={() =>
                              handleRemoveProduct(key, item.product_hash)
                            }
                            portalData={portalData}
                            isMaProduct={store?.store?.isMA === 1}
                          />
                        </div>
                      ))}
                    {/* Pass store-specific shippingSelections */}
                    {store.shippingSelections && (
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

export default withLoader(ShippingMethod);
