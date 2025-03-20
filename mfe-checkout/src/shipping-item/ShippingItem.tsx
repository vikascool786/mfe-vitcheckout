import React, { useState, useMemo, useEffect } from "react";
import { useAtom } from "jotai";
import { Close } from "../assets/svgs/Close";
import "./ShippingItem.scss";
import { Cashback } from "../assets/svgs/Cashback";
import { Address, Item, StoreDetail } from "../interfaces/ShippingMethod";
import { ITotal } from "../interfaces/ShopperCart";
import { Portal } from "../interfaces/Portal";
import { AutoshipIcon } from "../assets/icons/Autoship";
import { truncate } from "../utils/helpers/Helper";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { DropdownOption } from "../interfaces/DropdownOption";
import PaypalIcon from "../assets/images/PayPal.png";
import SezzleIcon from "../assets/images/Sezzle.png";

import {
  initialPaymentMethods,
  orderAtom,
  orderNotificationsAtom,
  paymentMethodsAtom,
} from "../store";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import {
  buildOrder,
  changeOrder,
  OrderResponse,
  updateProductQty,
} from "../api/service/Order";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_KEY,
} from "../utils/urlResolver";
import { useApi } from "../hooks/useAPI";
import { IOrderNotification } from "../utils/types/types";
import { CustomDropdownField } from "../component/Form/Field/CustomDropdownField";
import { getOptionStringValue } from "../utils/helpers/GetOptionStringValue";
import { PAYPAL } from "../payment-method/PaymentType";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import {isGiftCardStoreDetail} from "../utils/StoreUtils";

interface IProduct {
  imageUrl: string;
  name: string;
  description: string;
  cashback: string;
  price: string;
  quantity: number;
}

interface IShippingItemProps {
  item: Item;
  storeDetail: StoreDetail;
  total: ITotal;
  onRemove: (storeKey: string, itemKey: string) => void;
  portalData: Portal;
  isMaProduct: boolean;
  cartId: string;
  storeKey: string;
  isAddressSaved: boolean;
}

function createOptionMap(
  data: Array<{ optionStringValue: string; name: string; type: string }>
): Map<string, string> {
  const optionMap = new Map<string, string>();
  data.forEach((item) => {
    optionMap.set(item.name, item.optionStringValue);
  });
  return optionMap;
}

const hasDenomination = (
  option: Array<{ optionStringValue: string; name: string; type: string }>
) => {
  let denomination = false;
  for (let i = 0; i < option.length; i++) {
    if (option[i]?.type === "TEXT_BOX_CHECKOUT") {
      denomination = true;
      break;
    }
  }
  return denomination;
};

const formattedNumber = (num: any) => Number(num).toFixed(2);

const apiDomain = GET_API_ENDPOINT_BASE_URL_ONLY();
const apiKey = GET_API_KEY();

export const ShippingItem: React.FC<IShippingItemProps> = ({
  item,
  storeDetail,
  total,
  onRemove,
  portalData,
  isMaProduct,
  cartId,
  storeKey,
  isAddressSaved,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(
    item.quantity.toString()
  );
  const [pendingQuantity, setPendingQuantity] = useState(
    item.quantity.toString()
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);
  const [order, setOrder] = useAtom(orderAtom);
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  useEffect(() => {
    setSelectedQuantity(item.quantity.toString());
    setPendingQuantity(item.quantity.toString());
  }, [item.quantity]);

  const { image, caption, catalogName, totals, quantity } = item;
  const { catalogId, isMA } = storeDetail || {};
  const { bv, ibv } = item.totals;

  const isGiftCard = isGiftCardStoreDetail(storeDetail);

  const options = useMemo(() => {
    if (item.option && item.option.length > 0) {
      if (!isGiftCard || !hasDenomination(item.option)) {
        return (
          item.option && Array.from(createOptionMap(item.option).entries())
        );
      }
      const filteredOption = item.option.filter(
        (opt) => opt.type !== "POPUP_MENU"
      );
      return (
        filteredOption && Array.from(createOptionMap(filteredOption).entries())
      );
    }
  }, []);

  const decodeHtmlEntities = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const createQuantityOptions = (maxQuantity: number): DropdownOption[] => {
    return Array.from({ length: maxQuantity + 1 }, (_, i) => ({
      value: i.toString(),
      label: i === 0 ? "0 (Delete)" : i.toString(),
    }));
  };

  const handleQuantityChange = async (value: string) => {
    try {
      const newQuantity = parseInt(value);
      setPendingQuantity(value);

      if (value === "0") {
        onRemove(storeKey, item.product_hash);
      } else {
        setIsUpdating(true);
        setUpdateError(null);
        setItemError(null);

        const requestData = {
          id: cartId,
          products: [
            {
              id: item.prodId.toString(),
              type: "PROD",
              quantity: newQuantity,
              option: item.option,
              product_hash: item.product_hash,
            },
          ],
        };

        const response = await updateProductQty(cartId, requestData);

        if (response.data.response.notifications) {
          const notifications: IOrderNotification[] =
            response.data.response.notifications;
          if (notifications.length > 0) {
            const orderNotification = notifications.at(0)?.message;
            // setSelectedQuantity(
            //   response.data.response.success.data.quantity.toString()
            // );
            setItemError(orderNotification as string);
            setPendingQuantity(selectedQuantity);
            return;
          }
        }

        if (!response?.data?.response?.success?.data) {
          throw new Error("Failed to update quantity");
        }

        setSelectedQuantity(value);
        setPendingQuantity(value);

        if (order) {
          const updatedOrder = await buildOrder(
            generateChangeStoreResponse(order)
          );
          setItemError(null);
          const orderData = updatedOrder.response.success.data;
          setOrder(updatedOrder.response.success.data);

          // add paypal back if it exists in the payment methods

          const shouldShowPaypal =
          orderData?.paymentMethods.some(
            (method) =>
              method.type.toLowerCase() === PAYPAL.name.toLowerCase()
          ) &&
          paymentMethods.some(
            (method) => method.paymentMethod.typeID === PAYPAL.typeId
          );

          if (shouldShowPaypal) {
            // add paypal back if it exists in the payment methods on the 2nd last position if sezzle is present
            const sezzleIndex = orderData?.paymentMethods.findIndex(
              (method) => method.type.toLowerCase() === "sezzle"
            );

            const paypalPayment =
                initialPaymentMethods.find(
                    (method) => method.paymentMethod.typeID === PAYPAL.typeId
                ) || null;

            if (sezzleIndex > -1) {
              // Clone the array to avoid mutating state directly
              const updatedPaymentMethods = [...paymentMethods];

              // Ensure we don't insert at a negative index
              const insertIndex = Math.max(sezzleIndex - 1, 0);

              // Check if the PayPal account is already in the updatedPaymentMethods array
              const isPaypalAlreadyAdded = updatedPaymentMethods.some(method => method.paymentMethod.accountName === PAYPAL.name);

              if (!isPaypalAlreadyAdded && paypalPayment) {
                updatedPaymentMethods.splice(insertIndex, 0, paypalPayment);
              }

              setPaymentMethods(updatedPaymentMethods);
            } else {
              if(paypalPayment){
                setPaymentMethods([
                  ...paymentMethods,
                  paypalPayment,
                ])
              }
            }
          }
        }
      }
    } catch (error) {
      setUpdateError("Failed to update quantity");
      setPendingQuantity(selectedQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // Default max quantity - adjust as needed based on your requirements
  const maxAvailableStock = 30;
  const quantityOptions = createQuantityOptions(maxAvailableStock);

  const optionStringValue = () => {
    if (item.option) {
      const OptionStringValueData = getOptionStringValue(item.option);
      if (typeof OptionStringValueData === "string") {
        return OptionStringValueData;
      } else {
        return (
          <>
            {OptionStringValueData?.map((item, index) => (
              <p key={index} className="item-option-string-value">
                {item.label} {item.value}
              </p>
            ))}
          </>
        );
      }
    }
    return null;
  };
  return (
    <>
      {itemError && <div className="error-message">{itemError}</div>}
      <div className="item-container">
        <div className="item-detail-container">
          <div className="item-image">
            <img src={image.url} alt={caption} />
          </div>

          <div className="item-info">
            <section className="header-section">
              <div className="header-block">
                <div className="qa-name item-name">
                  {decodeHtmlEntities(caption)}
                </div>

                { !isGiftCard && (
                    <div>{optionStringValue()}</div>
                )}
              </div>

              <div className="shippingItem-priceStr">{totals?.priceStr}</div>
            </section>
            <section className="item-cashback">
              {totals?.cashBack > 0 && (
                <>
                  <div className="item-cashback-value">
                    + {totals?.cashBackStr}
                  </div>
                  <Cashback viewBox="0 -2 24 22" />
                  Cashback{" "}
                </>
              )}{" "}
              {bv > 0 && isMA && isMA === 1
                ? ` ${formattedNumber(bv)} BV`
                : ibv > 0 && ` ${formattedNumber(ibv)} IBV`}
            </section>

            <section className="price-section">
              {!isGiftCard && (
                <div className="quantity-selector">
                  <p className="item-quantity">Quantity</p>
                  <div className="quantity-dropdown-container">
                    <CustomDropdownField
                      key={`${item.product_hash}-${pendingQuantity}`}
                      qaTag={"qa-qty"}
                      className="form-field"
                      formName={`quantity-${catalogName}`}
                      selectedValue={pendingQuantity}
                      options={quantityOptions}
                      onChange={handleQuantityChange}
                      errorMessage={updateError as string}
                      disabled={isUpdating}
                    />
                  </div>
                  {isUpdating && (
                    <span className="updating-message">Updating...</span>
                  )}
                </div>
              )}
            </section>
            {(item.autoshipFreq > 0 || item.autoShipId) &&
              (portalData?.autoShipDiscount > 0 &&
                isMaProduct &&
                item.hasAutoShipDiscount ? (
                <div className="item-autoship">
                  <AutoshipIcon />
                  Saving {portalData.autoShipDiscount}% with Autoship
                </div>
              ) : (
                <div className="item-autoship">
                  <AutoshipIcon />
                  Repeating with Autoship
                </div>
              ))}
            {item.autoshipFreq > 0 && (
              <div>
                Frequency:{" "}
                <span className="item-autoship-frequency">
                  {item.autoshipFreq} days
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isGiftCard && options && options.length > 0 && (
        <div className="item-options">
          <ul>
            {options.map(([key, value]) => (
              <div key={key} className="item-options__row">
                <strong>{key}</strong> {truncate(value, 200)}
              </div>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
