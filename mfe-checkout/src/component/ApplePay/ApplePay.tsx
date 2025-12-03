
import React, {useCallback, useEffect, useRef} from 'react'
import { withApplePaySupport } from './withApplePaySupport';
import { useAtom } from 'jotai';
import {  orderAtom } from '../../store';
import { changeOrder, buildOrder } from '../../api/service/Order';
import { generateChangeStoreResponse } from '../../utils/helpers/GenerateChangeStoreResponse';
import { getLineItems, getMerchantSession, getShippingMethodsFromOrder, getOrderTotal, getCurrentSelectedShipping } from './ApplePayUtils';
import { fetchShopperDirectory } from '../../api/service/ShopperDirectory';
import { fetchShopperDetail } from '../../api/service/ShopperDetail';
import { isFullRegShopper, isEZRegShopper } from '../../interfaces/ShopperDirectory';
import { postEZReg } from '../../api/service/ShopperEZReg';
import { buildInitialGuestOrder } from '../../api/service/Order';
import { REG_TYPE_GUEST_CHECKOUT } from '../../api/service/ShopperEZReg';
import { useContentStrings } from '../../hooks/useContentStrings';
import { generateOrderTrackingId } from '../../utils/helpers/GenerateOrderTrackingId';
import { savePaymentMethod } from './ApplePayUtils';
import { decryptAppleData } from './ApplePayUtils';
import { APPLEPAY } from '../../payment-method/PaymentType';
import { handleStoreShippingSelections } from './ApplePayUtils';
interface ApplePayProps {
  confirmOrder: () => void;
  updateErrorMessage: (newMessage: string) => void;
  pcid: string;
  cartId: string;
  siteId: string;
  portalId: string;
}
const ApplePay: React.FC<ApplePayProps> =   ({
  confirmOrder,
  updateErrorMessage,
  pcid,
  siteId,
  cartId,
  portalId
}) => {
  const trackingData = new Map<string, string>();
  const [order, setOrder] = useAtom(orderAtom);
  const orderRef = useRef(order);
  const applePayState = useRef({
    customerId: ''
  });
  const { getString } = useContentStrings();


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
      total: { label: 'Market America', amount: getOrderTotal(orderRef.current!, true)},
      // couponCode: '',
      // "supportsCouponCode": true,
      requiredShippingContactFields: [
        "postalAddress",
        "name",
        "phoneticName",
        "phone",
        "email"
    ],
    requiredBillingContactFields: ["name", "email", "phone", "postalAddress"],
    "shippingMethods": getShippingMethodsFromOrder(orderRef.current!),
    lineItems: getLineItems(orderRef.current!, true)
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
              }, applePayState.current.customerId || ""),
              orderRef.current.id
            );
            const newOrderData = response.response.success.data;
            if (response.response.success?.notifications.length > 0) {
              session.completeCouponCodeChange({
                newTotal: {
                  label: "Market America",
                  amount: getOrderTotal(orderRef.current!, true)
                },
                newLineItems: getLineItems(orderRef.current, true),
                errors: [new window.ApplePayError("couponCodeInvalid",'', 'Invalid Coupon Code')]
              })
              return;
            }
            orderRef.current = newOrderData;;
            session.completeCouponCodeChange({
              newTotal: {
                label: "Market America",
                amount: getOrderTotal(orderRef.current!, true)
              },
              newLineItems: getLineItems(newOrderData, true), errors: []
            })
          }
        }


      }
    } catch (e) {
      session.completeCouponCodeChange({
        newTotal: {
          label: "Market America",
          amount: getOrderTotal(orderRef.current!, true)
        },
        newLineItems: getLineItems(orderRef.current!, true),
        errors: [new window.ApplePayError("couponCodeInvalid",'', 'Invalid Coupon Code')]
      })
    }
    }

    session.onshippingmethodselected = async (event: any) => {
      const method = event.shippingMethod.identifier;
      try {
        const response = await changeOrder(
          generateChangeStoreResponse({
            ...orderRef.current!, // Spread other stores
            stores: handleStoreShippingSelections(method, orderRef.current!),
          }, applePayState.current.customerId || ""),
          orderRef.current!.id
        );
        orderRef.current = response.response.success.data;
        session.completeShippingMethodSelection({
          newTotal: {
            label: "Market America",
            amount: getOrderTotal(orderRef.current!, true)
          },
          newLineItems: getLineItems(orderRef.current!, true),
        });
      } catch(e) {
        const error = new window.ApplePayError("shippingContactInvalid", null, "Error while changing address");
        session.completeShippingMethodSelection({
          newTotal: {
            label: "Market America",
            amount: getOrderTotal(orderRef.current!, true)
          },
          newLineItems: getLineItems(orderRef.current!, true),
          error: [error]
        });
      }
    
    }

    session.onshippingcontactselected = async (event: any) => {
      if (!orderRef.current) {
        return;
      }
      try {
        const {administrativeArea, country, countryCode, locality, postalCode,} = event.shippingContact;
        const newAddress = {
          address1: "city",
          city: locality,
          zip: postalCode,
          isoalpha3Code: countryCode,
          state: administrativeArea,
          country
        }
        const orderWithNewAddress = {
          ...orderRef.current!,
          shippingAddress: {       
            ...newAddress
          },
          billingAddress: {
           ...newAddress
          },
          userOptions: {
            ...orderRef!.current!.userOptions,
            portalId: portalId
          }
        };
       
        const changeOrderDetails = await buildOrder(
          generateChangeStoreResponse(orderWithNewAddress, applePayState.current.customerId || "")
        );
        if (changeOrderDetails.response.success.data) {
          orderRef.current = changeOrderDetails.response.success.data
        }
        session.completeShippingContactSelection({
        newTotal: {
          label: "Market America",
          amount: getOrderTotal(orderRef.current!, true)
        },
        newLineItems: getLineItems(orderRef.current!, true),
        newShippingMethods: getShippingMethodsFromOrder(orderRef.current)
      })

      } catch(e) {
        console.log('Error while changing address', e)
        session.completeShippingContactSelection({
          newTotal: {
            label: "Market America",
            amount: getOrderTotal(orderRef.current!, true)
          },
          newLineItems: getLineItems(orderRef.current!, true),
          newShippingMethods: getShippingMethodsFromOrder(orderRef.current),
          errors: [new window.ApplePayError("shippingContactInvalid", null, "Error while changing address")]
        })
      }
    }

    session.onpaymentauthorized = async (event: any) => {
      const {payment} = event;
        let guestShopper = '';
        let portalId = '';
        let shippingAddress = null;
        let fullAddress= {};
       let errors = []; 
       let email = payment.shippingContact.emailAddress;
        // first we need to create cart based on the user following the steps in Contact.tsx
        try {
          // Await the initial fetchShopperDirectory Promise
          const response = await fetchShopperDirectory(email);
  
          if (response?.foreign) {
              // Handle foreign shopper case
              const emailAddressError = new window.ApplePayError(
                  "recipientContactInvalid",
                  null,
                  "The email address entered is for an account on a another SHOP.COM site, please use a valid email"
              );
              errors.push(emailAddressError);
  
          } else if (isFullRegShopper(response) || isEZRegShopper(response)) {
              // Handle existing registered shopper case
              guestShopper = response.shopperID;
              
              try {
                  // Await the nested fetchShopperDetail Promise
                  const detailResponse = await fetchShopperDetail(response.shopperID);
                  
                  if (detailResponse.shopperAccountDisabled === 1) {
                      // Handle disabled account case
                      const accountDisabledError = new window.ApplePayError(
                          "recipientContactInvalid", 
                          null, 
                          getString("emailAddressError", ['1-866-420-1709'])
                      );
                      errors.push(accountDisabledError); 
                      return; // Exit if account is disabled
                  }
                  
                  applePayState.current.customerId = detailResponse.pcid;
                  portalId = detailResponse.portal?.portalId;
                  
                  // Await the nested buildInitialGuestOrder Promise
                  const orderResponse = await buildInitialGuestOrder(cartId, portalId, detailResponse.pcid, shippingAddress);
                  orderRef.current = orderResponse?.response.success?.data || null;
                  
              } catch (error) {
                  // You may want specific error handling for fetchShopperDetail failure here
                  console.error("APP fetchShopperDetail error: ", error);
                  // Depending on requirements, you might push an error to the errors array
              }
  
          } else {
              // Handle new EZ registration (Guest Checkout) case
              try {
                  // Await the nested postEZReg Promise
                  const ezRegResponse = await postEZReg(email, portalId, REG_TYPE_GUEST_CHECKOUT, false);
                  const ezPcid = ezRegResponse?.shopper?.pcid;
                  applePayState.current.customerId = ezPcid;
                  
                  // Await the nested buildInitialGuestOrder Promise
                  const orderResponse = await buildInitialGuestOrder(cartId, portalId, ezPcid, shippingAddress);
                  orderRef.current = orderResponse?.response.success?.data || null;

              } catch (error) {
                  // Handle the postEZReg rejection (the original .catch block)
                  console.error("EZ reg error: ", error);
                  const errorMessage =
                      error?.response?.data ??
                      error?.message ??
                      "This email address cannot be used. Please try again.";
                  const errorEmail = new window.ApplePayError("recipientContactInvalid", null, errorMessage);   
                  errors.push(errorEmail);
              }
          }
          
      } catch (error) {
          // This is where you would catch errors from the initial fetchShopperDirectory call
          console.error("APP fetchShopperDirectory initial error: ", error);
          const errorUserEmail = new window.ApplePayError("recipientContactInvalid", null, "There was an error processing your order!");  
          errors.push(errorUserEmail);
          // Depending on requirements, you might push a general network/API error to errors array
      }
        if (errors.length > 0) {
          session.completePayment({
            status: window.ApplePaySession.STATUS_FAILURE,
            errors
          });
          return;
        }
        const {addressLines, administrativeArea, country, countryCode, locality, postalCode, familyName, givenName} = payment.shippingContact;
        const oldShippingSelections = getShippingMethodsFromOrder(orderRef.current!);
         fullAddress = {
          address1: addressLines[0] || '',
          city: locality,
          zip: postalCode,
          isoalpha3Code: countryCode,
          state: administrativeArea,
          country,
          first: givenName,
          last: familyName
        }
        const orderWithNewAddress = {
          ...orderRef.current!,
          shippingAddress: {
            ...fullAddress
          },
          billingAddress: {
            ...fullAddress
          }
        };
       
        const changeOrderDetails = await buildOrder(
          generateChangeStoreResponse(orderWithNewAddress, applePayState.current.customerId || "")
        );
        if (changeOrderDetails.response.success.data) {
          orderRef.current = changeOrderDetails.response.success.data
        }
        const newShippingSelection = getShippingMethodsFromOrder(orderRef.current!);
        const currentSelectedShipping = getCurrentSelectedShipping(orderRef.current!);
        const hasSelectedShippingChanged = newShippingSelection.find(selection => selection.amount == currentSelectedShipping.total && selection.id== currentSelectedShipping.id);
        if (!hasSelectedShippingChanged) {
            const error =  new window.ApplePayError("shippingContactInvalid", null, "Shipping Method has changed!");
            session.completePayment({
              status: window.ApplePaySession.STATUS_FAILURE,
              errors: [error]
            })
            return;
        }
       try {
            const decryptedPayment = await decryptAppleData(payment, orderRef.current!.totals.price.toString(), "USD"); 
            if (decryptedPayment.error) {
              let errorMessage = decryptedPayment.error.message;
              session.completePayment(window.ApplePaySession.STATUS_FAILURE);
              throw new Error(errorMessage);
            }
            const savePaymentPayload = {
              number: decryptedPayment.ipgTransactionId, 
              number2: decryptedPayment.clientRequestId,
              token:  decryptedPayment.orderId,
              siteId: siteId,
              type: APPLEPAY.typeId,
              name: guestShopper,
              address1: addressLines[0] || '',
              first: givenName,
              last: familyName,
              city: locality,
              state: administrativeArea,
              zip: postalCode
            }
          const savedPaymentMethod = await savePaymentMethod(savePaymentPayload, guestShopper!);
          const changeOrderDetails = generateChangeStoreResponse(orderRef.current!, applePayState.current.customerId || "");
          trackingData.set("applePay", "");
          const changeOrderPayload = {
            ...changeOrderDetails,
            paymentMethod: {
            ...savedPaymentMethod
            },
            billing: fullAddress,
            userOptions: {
              ...changeOrderDetails.userOptions,
              trackingData: generateOrderTrackingId(trackingData)
            }
          }

          await changeOrder(changeOrderPayload, orderRef.current!.id!);
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
    <>
      <apple-pay-button
    buttonstyle="black"
    type="plain"
    locale="en-US"
    id="mfe-apple-pay-button"
     />
  </>

  )
};
export const ApplePayButton = withApplePaySupport(ApplePay);