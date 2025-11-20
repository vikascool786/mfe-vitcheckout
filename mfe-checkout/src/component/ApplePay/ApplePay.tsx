
import React, {useCallback, useEffect, useRef} from 'react'
import { withApplePaySupport } from './withApplePaySupport';
import { useAtom, useAtomValue } from 'jotai';
import { guestShopperIdAtom, orderAtom } from '../../store';
import { changeOrder, getShippingMethods } from '../../api/service/Order';
import { generateChangeStoreResponse } from '../../utils/helpers/GenerateChangeStoreResponse';
import { getLineItems, getMerchantSession, getShippingMethodsFromOrder, getOrderTotal } from './ApplePayUtils';
import { generateOrderTrackingId } from '../../utils/helpers/GenerateOrderTrackingId';
import { APPLEPAY } from '../../payment-method/PaymentType';
import { savePaymentMethod, decryptAppleData } from './ApplePayUtils';

interface ApplePayProps {
  confirmOrder: () => void;
  updateErrorMessage: (newMessage: string) => void;
  pcid: string;
  cartId: string;
  siteId: string;
}
const ApplePay: React.FC<ApplePayProps> =   ({
  confirmOrder,
  updateErrorMessage,
  pcid,
  cartId,
  siteId
}) => {
  const shopperId = useAtomValue(guestShopperIdAtom);
  const trackingData = new Map<string, string>();
  const [order, setOrder] = useAtom(orderAtom);
  const orderRef = useRef(order);


  useEffect(() => {
    orderRef.current = order;
  }, [order])

const onCreateSession = useCallback(() => {
  const request = {
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS', "supportsDebit",
      "supportsCredit"],
      total: { label: 'Market America', amount: getOrderTotal(orderRef.current!)},
      couponCode: '',
      "supportsCouponCode": true,
      requiredShippingContactFields: [
        "postalAddress",
        "name",
        "phoneticName",
        "phone",
        "email"
    ],
    requiredBillingContactFields: ["name", "email", "phone", "postalAddress"],
    "shippingMethods": getShippingMethodsFromOrder(orderRef.current!),
    lineItems: getLineItems(orderRef.current!)
    };
    const session = new window.ApplePaySession(14, request)
    session.begin();
    session.onvalidatemerchant = async () => {
      const merchantSession = await getMerchantSession();
      session.completeMerchantValidation(merchantSession);
    }
    session.oncouponcodechanged = async (event: any) => {
      const couponCode = event.couponCode;
    try {
      if (couponCode) {
        if (orderRef.current) {
          const {coupons} = orderRef.current?.userOptions || {};
          const trimmedCoupon = couponCode.trim();

          if (trimmedCoupon && (!coupons || !coupons.includes(trimmedCoupon))) {
            // Create a new coupons array with the new coupon
            const updatedCoupons = coupons
              ? [...coupons, trimmedCoupon]
              : [trimmedCoupon];

      
            const response = await changeOrder(
              generateChangeStoreResponse({
                ...orderRef.current,
                userOptions: {
                  ...orderRef.current.userOptions,
                  coupons: updatedCoupons,
                },
              }, pcid),
              orderRef.current.id
            );
            const newOrderData = response.response.success.data;
            if (response.response.success?.notifications.length > 0) {
              session.completeCouponCodeChange({
                newTotal: {
                  label: "Market America",
                  amount: orderRef.current.totals.price
                },
                newLineItems: getLineItems(orderRef.current),
                errors: [new window.ApplePayError("couponCodeInvalid",'', 'Invalid Coupon Code')]
              })
              return;
            }
            setOrder(newOrderData);
            session.completeCouponCodeChange({
              newTotal: {
                label: "Market America",
                amount: newOrderData.totals.price
              },
              newLineItems: getLineItems(newOrderData), errors: []
            })
          }
        }


      }
    } catch (e) {
      session.completeCouponCodeChange({
        newTotal: {
          label: "Market America",
          amount: order?.totals.price
        },
        newLineItems: getLineItems(order!),
        errors: [new window.ApplePayError("couponCodeInvalid",'', 'Invalid Coupon Code')]
      })
    }
    }

    session.onshippingmethodselected = (event: any) => {
      session.completeShippingMethodSelection({
        newTotal: {
          label: "Market America",
          amount: order?.totals.price
        }
      })
    }

    session.onshippingcontactselected = async (event: any) => {
      const shippingContact = event.shippingContact;
      const zip = shippingContact.postalCode;
      const isoalpha3Code = shippingContact.countryCode;
      const country = shippingContact.country;
      const city = shippingContact.locality;
      const state = shippingContact.administrativeArea;
      const errors = [];
      if (!orderRef.current) {
        return;
      }
      try {

      const changeOrderDetails = await getShippingMethods(cartId, {
        ...orderRef.current,
             shippingAddress: {
                first: "",
                last:"",
                address1: "",
                city,
                zip,
                isoalpha3Code,
                state,
                country
              },
      })
  
      // if (postalCode !== "44000") {
      //   errors.push(new window.ApplePayError("shippingContactInvalid",'postalCode', 'Invalid Zip Code'));
      // }
      // if (country !== "US") {
      //   errors.push(new window.ApplePayError("shippingContactInvalid",'countryCode', 'We dont ship outside US'))
      // }
      if (errors.length > 0) {
      
        session.completeShippingContactSelection(
          {
            newTotal: {
              label: "Market America",
              amount: orderRef.current?.totals.price
            },
            newLineItems: getLineItems(orderRef.current!),
            newShippingMethods: getShippingMethodsFromOrder(orderRef.current),
            errors
          }
        );
        return;
      }
      session.completeShippingContactSelection({
        newTotal: {
          label: "Market America",
          amount: orderRef.current?.totals.price
        },
        newLineItems: getLineItems(orderRef.current!),
        newShippingMethods: getShippingMethodsFromOrder(orderRef.current)
      })

      } catch(e) {
          console.log('Something went wrong while changing address', e)
      }
    }
    session.onpaymentauthorized = async (event: any) => {
      const { payment } = event;
      try {
     const decryptedPayment = await decryptAppleData(payment, orderRef.current!.totals.price.toString(), "USD"); 
     if (decryptedPayment.error) {
      let errorMessage = decryptedPayment.error();
      session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      throw new Error(errorMessage);
     }
     const savePaymentPayload = {
      number: decryptedPayment.ipgTransactionId, 
      number2: decryptedPayment.clientRequestId,
      token: decryptedPayment.orderId,
      siteId: siteId,
      type: APPLEPAY.typeId,
      name: shopperId
     }
  const savedPaymentMethod = await savePaymentMethod(savePaymentPayload, shopperId!);
  const changeOrderDetails = generateChangeStoreResponse(orderRef.current!, pcid);
  trackingData.set("applePay", "");
  const changeOrderPayload = {
    ...changeOrderDetails,
    paymentMethod: {
     ...savedPaymentMethod
    },
    billing: order?.shippingAddress,
    userOptions: {
      ...changeOrderDetails.userOptions,
      trackingData: generateOrderTrackingId(trackingData)
    }
  }
  await changeOrder(changeOrderPayload, order?.id!);
  confirmOrder();
  session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
      } catch (e) {
        console.log('Something went wrong!', e);
        updateErrorMessage(e as string);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      }
    }
    
}, [order])

useEffect(() => {
  const applePayBtn = document.getElementById("mfe-apple-pay-button");
  if (!applePayBtn){
    return;
  }
  applePayBtn.addEventListener("click", onCreateSession);
  return () => applePayBtn.removeEventListener("click", onCreateSession)

}, [onCreateSession])
  return (
      <apple-pay-button
    buttonstyle="black"
    type="order"
    locale="en-US"
    id="mfe-apple-pay-button"
     />

  )
};
export const ApplePayButton = withApplePaySupport(ApplePay);