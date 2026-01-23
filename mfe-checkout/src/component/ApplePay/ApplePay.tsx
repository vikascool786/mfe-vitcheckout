
import React, {useCallback, useEffect, useRef, useState} from 'react'
import { withApplePaySupport } from './withApplePaySupport';
import { useAtom, useSetAtom } from 'jotai';
import {  applePayAtom, orderAtom } from '../../store';
import { changeOrder, buildOrder } from '../../api/service/Order';
import { generateChangeStoreResponse } from '../../utils/helpers/GenerateChangeStoreResponse';
import { getLineItems, getMerchantSession, getShippingMethodsFromOrder, getOrderTotal,  getCurrentSelectedShipping, getSupportedApplePayVersion } from './ApplePayUtils';
import { fetchShopperDirectory } from '../../api/service/ShopperDirectory';
import { fetchShopperDetail } from '../../api/service/ShopperDetail';
import { isFullRegShopper, isEZRegShopper } from '../../interfaces/ShopperDirectory';
import { postEZReg } from '../../api/service/ShopperEZReg';
import { REG_TYPE_GUEST_CHECKOUT } from '../../api/service/ShopperEZReg';
import { useContentStrings } from '../../hooks/useContentStrings';
import { generateOrderTrackingId } from '../../utils/helpers/GenerateOrderTrackingId';
import { savePaymentMethod } from './ApplePayUtils';
import { decryptAppleData } from './ApplePayUtils';
import { APPLEPAY } from '../../payment-method/PaymentType';
import { handleStoreShippingSelections } from './ApplePayUtils';
import './ApplePay.scss';
import ApplePayEmailDialog from './ApplePayEmailDialogue';


interface ApplePayProps {
  confirmOrder: any;
  siteId: string;
  portalId: string;
}
const ApplePay: React.FC<ApplePayProps> =   ({
  confirmOrder,
  siteId,
  portalId
}) => {
  const  setIsApplePayActive= useSetAtom(applePayAtom);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const trackingData = new Map<string, string>();
  const [order, setOrder] = useAtom(orderAtom);
  const [custId, setCustId] = useState("");
   const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const orderRef = useRef(order);
  const applePayState = useRef({
    customerId: '',
    email: '',
    guestShopper: '',
    portalId: ''
  });
  const { getString } = useContentStrings();

  useEffect(() => {
    orderRef.current = order;
  }, [order])

const onCreateSession = useCallback(() => {
  const version = getSupportedApplePayVersion();
  if (!version) {
    throw new Error("There was a problem in apple pay version");
  }
  const request = {
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS', "supportsDebit",
      "supportsCredit"],
      total: { label: 'Market America', amount: getOrderTotal(orderRef.current!, true)},
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
    lineItems: getLineItems(orderRef.current!, true)
    };
    // this is added to let the api know we are now using apple pay
    orderRef.current = {
      ...orderRef.current,
      paymentMethod: {
        type: "Apple Pay",
        typeID: 50,
        categoryID: 7
    }
    };
    const session = new window.ApplePaySession(version, request)
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
      const initialTotal = orderRef.current?.totals.price;
      const {payment} = event;
      const {addressLines, administrativeArea, country, locality, postalCode, familyName, givenName} = payment.shippingContact;
        let shippingAddress = {
          address1: addressLines[0] || '',
          city: locality,
          zip: postalCode,
          state: administrativeArea,
          country,
          first: givenName,
          last: familyName
        };
        const finalTotal = orderRef.current?.totals.price;
        if (initialTotal != finalTotal) {
          session.completePayment({
            status: window.ApplePaySession.STATUS_FAILURE,
            errors: [new window.ApplePayError("unknown", null, "There was an issue with total. Please try again!")]
          });
          return;
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
              name: applePayState.current.guestShopper,
              address1: addressLines[0] || '',
              first: givenName,
              last: familyName,
              city: locality,
              state: administrativeArea,
              zip: postalCode
            }
          const savedPaymentMethod = await savePaymentMethod(savePaymentPayload, applePayState.current.guestShopper! || applePayState.current.customerId);
          const changeOrderDetails = generateChangeStoreResponse(orderRef.current!, applePayState.current.customerId || "");
          trackingData.set("applePay", "");
          const changeOrderPayload = {
            ...changeOrderDetails,
            paymentMethod: {
            ...savedPaymentMethod
            },
            shipping: shippingAddress,
            billing: shippingAddress,
            userOptions: {
              ...changeOrderDetails.userOptions,
              trackingData: generateOrderTrackingId(trackingData)
            }
          }

          await changeOrder(changeOrderPayload, orderRef.current!.id!);
          confirmOrder(true, applePayState.current.email);
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
         // setIsApplePayActive(false);
              } catch (e) {
                console.log('Something went wrong!', e);
                const message = e instanceof Error ? e?.message : e || "Something went wrong!";
                setErrorMessage(message as string)
                session.completePayment(window.ApplePaySession.STATUS_FAILURE);
              }
    }
    session.oncancel = () => {
      setIsApplePayActive(false);
    }
    
}, [order])


const handleApplePay = () => {
  setIsApplePayActive(true);
  setOpenEmailDialog(true);
  setErrorMessage('');
}



const handleEmailSubmit = async (email: string) => {
  applePayState.current.email = email;
  applePayState.current.customerId = ""
  applePayState.current.guestShopper = "";
  setCustId('');
  setEmailErrorMessage('');
  try {
    // Await the initial fetchShopperDirectory Promise
    const response = await fetchShopperDirectory(email);

    if (response?.foreign) {
        // Handle foreign shopper case
       setEmailErrorMessage("The email address entered is for an account on a another SHOP.COM site, please use a valid email")

    } else if (isFullRegShopper(response) || isEZRegShopper(response)) {
        // Handle existing registered shopper case
        applePayState.current.guestShopper = response.shopperID;
        
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
               // errors.push(accountDisabledError); 
                return; // Exit if account is disabled
            }
            
            applePayState.current.customerId = detailResponse.pcid;
            setCustId(detailResponse.pcid)
            applePayState.current.portalId = detailResponse.portal?.portalId;
            applePayState.current.guestShopper = detailResponse.cid;
            
            // Await the nested buildInitialGuestOrder Promise
          //  const orderResponse = await buildInitialGuestOrder(cartId, portalId, detailResponse.pcid, shippingAddress);
          const orderResponse = await buildOrder(
            generateChangeStoreResponse(orderRef.current!, applePayState.current.customerId || "")
          );
            orderRef.current = orderResponse?.response.success?.data || null;
            
        } catch (error) {
            // You may want specific error handling for fetchShopperDetail failure here
            console.error("APP fetchShopperDetail error: ", error);
            setEmailErrorMessage(`There was an error fetching shopper details:${error}`, )
            // Depending on requirements, you might push an error to the errors array
        }

    } else {
        // Handle new EZ registration (Guest Checkout) case
        try {
            // Await the nested postEZReg Promise
            const ezRegResponse = await postEZReg(email, portalId, REG_TYPE_GUEST_CHECKOUT, false);
            const ezPcid = ezRegResponse?.shopper?.pcid;
            applePayState.current.customerId = ezPcid;
            applePayState.current.guestShopper = ezRegResponse.cid;
            setCustId(ezPcid);
            
            // Await the nested buildInitialGuestOrder Promise
            const orderResponse = await await buildOrder(
              generateChangeStoreResponse(orderRef.current!, applePayState.current.customerId || "")
            );
            orderRef.current = orderResponse?.response.success?.data || null;

        } catch (error) {
            // Handle the postEZReg rejection (the original .catch block)
            console.error("EZ reg error: ", error);
            const errorMessage =
                error?.response?.data ??
                error?.message ??
                "This email address cannot be used. Please try again.";
                setEmailErrorMessage(errorMessage);
        }
    }


    
} catch (error) {
    // This is where you would catch errors from the initial fetchShopperDirectory call
    console.error("APP fetchShopperDirectory initial error: ", error); 
    setEmailErrorMessage(`Error fetching shopper detail: ${error}`)
}
}

const onApplePayEmailDialogClose = (next: string) => {
  setOpenEmailDialog(false); setCustId('');
  if (next !== 'createSession') {
    setIsApplePayActive(false);
  }
  
}

  return (
    <div className="apple-pay-button-container">
        <button
              className={`apple-pay-btn enabled`}
              onClick={handleApplePay}
            >
              <span className="apple-pay-inner">
                <span className="txt">Continue with Apple Pay</span>
              </span>
            </button>
            {errorMessage.length > 0 && (
                <div className="error-message-order">
                  <div className="error-message-order--bold">{errorMessage}</div>
                </div>
              )}
     <ApplePayEmailDialog open={openEmailDialog} onClose={onApplePayEmailDialogClose} onSubmit={handleEmailSubmit} customerId={custId} onCreateSession={onCreateSession} errorMessage={emailErrorMessage} />
  </div>
  )
};
export const ApplePayButton = withApplePaySupport(ApplePay);