import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import {
  fetchShoppersPaymentMethods,
  generatePayPalTransactionDetails,
} from "../api/service/ShoppersPaymentMethods";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import { Back } from "../assets/svgs/Back";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { PaymentOption } from "../payment-method-option/PaymentMethodOption";
import {
  initialPaymentMethods,
  IPaymentOption,
  orderAtom,
  paymentMethodsAtom,
} from "../store";
import { TextUpdates } from "../text-updates/TextUpdates";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import "./PaymentMethods.scss";
import * as Yup from "yup";
import {
  CLICK2PAY,
  creditCardTypeIds,
  isThirdPartyPayment,
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { SiteFlags } from "../interfaces/SiteFlags";
import { portalApiData } from "../checkout/portalAtom";
import { orderHasAutoshipItems } from "../utils/OrderUtils";
import { FormikProvider, useFormik } from "formik";
import { getVisibleCardOptionsImages } from "../utils/helpers/GetVisibleCardImages";
import { IPaymentMethod2 } from "../interfaces/Order";
import Click2PayCardLoader from "../payment-method-click2pay/Click2PayCardLoader";

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
  siteId: string;
  pcid: string;
  updatePaymentTypeId: (newValue: number) => void;
}

const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  pcid,
  updatePaymentTypeId,
}) => {
  // initial payment methods
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  const [isExpanded, setIsExpanded] = useState(false);

  // addresses for user wallet
  const { addresses } = useShopperEWalletAddresses(shopperId || "");

  const [order] = useAtom(orderAtom);

  const shouldShowClick2Pay = order?.paymentMethods.some(
    (method) => method.typeID === CLICK2PAY.typeId
  );
  const [showClick2Pay, setShowClick2Pay] = useState(shouldShowClick2Pay);

  const shouldShowPaypal = order?.paymentMethods.some(
    (method) => method.type.toLowerCase() === PAYPAL.name.toLowerCase()
  );

  const [isPaymentsFetched, setIsPaymentsFetched] = useState<boolean>(false);

  const [showNewCard, setShowNewCard] = useState<boolean>(false);
  const [portalData] = useAtom(portalApiData(shopperId));
  const [thirdPartySiteFlagData, setThirdPartySiteFlagData] = useState<
    SiteFlags[]
  >([]);
  const [isClick2PayCardSelected, setIsClick2PayCardSelected] =  useState<boolean>(false);

  useEffect(() => {
    const paymentSiteFlagList = thirdPartyPaymentFlagList().join(",");
    const fetchSiteFlagInfo = async () => {
      try {
        const response: SiteFlags[] = await fetchSiteFlagData(
          siteId,
          paymentSiteFlagList
        );
        setThirdPartySiteFlagData(response);
        paymentMethods.map((method) => {
          const c2pSiteflag = response.find(
            (item: any) => item.flagID === CLICK2PAY.siteflagTypeId
          );
          setShowClick2Pay(c2pSiteflag ? c2pSiteflag.active : false);
        });
      } catch (error) {
        console.error("Failed to fetch siteflag data:", error);
      }
    };

    fetchSiteFlagInfo();
  }, []);

  useEffect(() => {
    const fetchShoppersSavedPayments = async (
      shopperId: string,
      addresses: Address[]
    ) => {
      const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
          token: params.get("token"),
          payerId: params.get("PayerID"),
        };
      };

      // checking paypal order success
      const { token, payerId } = getQueryParams();

      const isPaypalOrderSuccess = token && payerId;
      const addressMap = new Map<string, Address>();
      const showPayPalSelected = !!token;

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );

      try {
        const response = await fetchShoppersPaymentMethods(shopperId);

        let staticMethods = paymentMethods;

        if (!isSezzleAllowed()) {
          staticMethods = staticMethods.filter(
            (method) => method.paymentMethod.typeID !== SEZZLE.typeId
          );
        }

        if (!shouldShowPaypal) {
          staticMethods = staticMethods.filter(
            (method) => method.paymentMethod.typeID !== PAYPAL.typeId
          );
        }

        // case when user does not have any payment methods
        if (!response) {
          if (paymentMethods.some(pm => pm.paymentMethod.id === 0)) return
          const newCard = createPaymentMethod({
            accountName: "",
            imageUrl: CardOptions,
            id: 0,
            typeID: 9,
            addressId: 0,
            expMonth: new Date().getMonth() + 1,
          });

          // [new card, paypal, sezzle]
          staticMethods = [
            {
              paymentMethod: newCard,
              paymentAddress: {} as Address,
              isPaymentValidated: false,
              isSelected: true,
              isVisible: true,
              isEditing: true,
            },
            ...paymentMethods,
          ];

          setPaymentMethods(staticMethods);
          setIsPaymentsFetched(true);
          return;
        }

        let paymentOptions = response.map((paymentMethod) => {
          const isPreferred = paymentMethod.preferred;

          if (isPreferred) {
            staticMethods = staticMethods.map((sm) => ({
              ...sm,
              isSelected: false,
            }));
          }
          // fetch saved cards from wallet
          return {
            paymentMethod,
            // set address based on the address id
            paymentAddress: addressMap.get(paymentMethod.addressId.toString()),
            isVisible: isPreferred,
            isSelected: isPreferred,
          } as IPaymentOption;
        });

        const preferredPaymentMethod = paymentOptions.find(
          (option) => option.paymentMethod.preferred
        );
        if (!preferredPaymentMethod) {
          paymentOptions = paymentOptions.map((option, index) => ({
            ...option,
            isVisible: index === 0,
            isSelected: index === 0,
          }));
        }
        let updatedPaymentOptions = [...paymentOptions, ...staticMethods];

        if (showPayPalSelected) {
          // set paypal as selected and only show items visible which are true

          updatedPaymentOptions = updatedPaymentOptions.map((paymentOption) => {
            if (paymentOption.paymentMethod.typeID === PAYPAL.typeId) {
              updatePaymentTypeId(paymentOption.paymentMethod.typeID);
              // set paypal true
              return {
                ...paymentOption,
                isSelected: true,
              };
            } else {
              // rest will set as false
              return {
                ...paymentOption,
                isSelected: false,
                isVisible:
                  paymentOption.paymentMethod.typeID === SEZZLE.typeId ||
                  paymentOption.isVisible,
              };
            }
          });
        }

        setTimeout(() => {
          setPaymentMethods(updatedPaymentOptions);
          setIsPaymentsFetched(true);
        }, 300);
      } catch (error) {
        console.log("Error fetching payment methods", error);
        // in case fetching payment api fails and user has a successful paypal transaction
        // let user proceed with paypal
        if (isPaypalOrderSuccess) {
          await generatePayPalTransactionDetails(shopperId, token, true, false);

          const updatedPaymentOptions = paymentMethods.map((paymentOption) => {
            if (paymentOption.paymentMethod.typeID === PAYPAL.typeId) {
              return {
                ...paymentOption,
                isSelected: true,
              };
            } else {
              return {
                ...paymentOption,
                isSelected: false,
                isVisible: paymentOption.isVisible,
              };
            }
          });

          setPaymentMethods(updatedPaymentOptions);
          setIsPaymentsFetched(true);
        }
      }
    };

    if (addresses && paymentMethods.length < 3) {
      fetchShoppersSavedPayments(shopperId, addresses);
    }
  }, [shopperId, addresses]);

  useEffect(() => {
    let updatedPMs = paymentMethods;
    if (!isSezzleAllowed()) {
      updatedPMs = paymentMethods.filter(
        (method) => method.paymentMethod.typeID !== SEZZLE.typeId
      );
    } else if (
      !paymentMethods.some(
        (method) => method.paymentMethod.typeID === SEZZLE.typeId
      )
    ) {
      const sezzlePayment =
        initialPaymentMethods.find(
          (method) => method.paymentMethod.typeID === SEZZLE.typeId
        ) || null;
      if (sezzlePayment) {
        updatedPMs = [...paymentMethods, sezzlePayment];
      }
    }
    setPaymentMethods(updatedPMs);
  }, [order, isPaymentsFetched]);

  const isSezzleAllowed = (): boolean => {
    //sezzle rules dependent on site
    const sezzleSiteFlag = getSiteFlagDataForType(SEZZLE.siteflagTypeId || 0);
    if (!sezzleSiteFlag?.active) {
      return false;
    }
    //sezzle rules dependent on portal
    if (portalData?.hasItransact) {
      if (sezzleSiteFlag.auxDataText) {
        const jsonData = JSON.parse(sezzleSiteFlag.auxDataText);
        if (!jsonData.enableForItransact) {
          return false;
        }
      }
    }
    //sezzle rules dependent on order, min order, autohship
    //filter payment method types from order response
    if (order) {
      const isSezzleInAcceptedPayments =
        order.paymentMethods.filter(
          (method: IPaymentMethod2) => method.typeID === SEZZLE.typeId
        ).length > 0;
      let isAutoshipAllowed = false;
      if (sezzleSiteFlag?.auxDataText) {
        const jsonData = JSON.parse(sezzleSiteFlag.auxDataText);
        isAutoshipAllowed = jsonData.supportedForAutoship;
      }
      if (!isAutoshipAllowed && orderHasAutoshipItems(order)) {
        return false;
      }
      return isSezzleInAcceptedPayments;
    }
    return false;
  };

  const getSiteFlagDataForType = (siteflagTypeId: number) => {
    if (thirdPartySiteFlagData) {
      return thirdPartySiteFlagData.find(
        (item: any) => item.flagID === siteflagTypeId
      );
    }
    return null;
  };

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      let filteredPaymentMethods = paymentMethods;
      //remove cc entry option
      filteredPaymentMethods = paymentMethods.filter(
          (payment) => payment.paymentMethod.id !== 0
      );
      setPaymentMethods(
          filteredPaymentMethods.map((item) => ({
          ...item,
          isSelected: false,
        }))
      );
      updatePaymentTypeId(CLICK2PAY.typeId);
      setIsClick2PayCardSelected(true);
    };
    document.addEventListener(
      "c2pSelectedCard",
      handleDeselectPaymentMethodsEvent
    );
    return () => {
      document.removeEventListener("c2pSelectedCard", handleDeselectPaymentMethodsEvent);
    };
  }, [paymentMethods.length]);

  const toggleAccordion = () => {
    const paymentString = ["Paypal"];

    if (isSezzleAllowed()) {
      paymentString.push("Sezzle");
    }
    if (isExpanded) {
      // Collapse: Only show preferred, PayPal, and Sezzle
      const updatedPaymentMethods = paymentMethods.map((paymentMethod) => ({
        ...paymentMethod,
        isVisible:
          paymentMethod.paymentMethod.preferred ||
          paymentString.includes(paymentMethod.paymentMethod.accountName),
      }));

      setPaymentMethods(updatedPaymentMethods);
    } else {
      // Expand: Show all items

      const updatedPaymentMethods = paymentMethods.map((paymentMethod) => {
        if (isSezzleAllowed()) {
          return {
            ...paymentMethod,
            isVisible: true,
          };
        } else
          return {
            ...paymentMethod,
            isVisible: true,
          };
      });
      setPaymentMethods(updatedPaymentMethods);
    }

    setIsExpanded(!isExpanded);
  };

  const onAddNewCard = () => {
    // Check if a card with id 0 is already present
    updatePaymentTypeId(0);
    const hasTemporaryCard = paymentMethods.some(
      (paymentOption) => paymentOption.paymentMethod.id === 0
    );

    if (hasTemporaryCard) {
      onCollapse(0);
      updatePaymentTypeId(0);

      // If a card with id 0 already exists, do not update payment methods
      console.warn("Temporary card already exists. Cannot add a new one.");
      return;
    }

    // Create the new card
    const newCard = createPaymentMethod({
      accountName: "",
      imageUrl: CardOptions,
      id: 0,
      typeID: 9,
      addressId: 0,
      expMonth: new Date().getMonth() + 1,
    });

    setShowNewCard(true);
    // while adding new card makeing new credit card as selected
    const updatedPaymentOptions = paymentMethods.map((paymentOption) => ({
      ...paymentOption,
      isSelected: false,
      isEditing: false,
    }));

    setPaymentMethods([
      ...updatedPaymentOptions,
      {
        paymentMethod: newCard,
        paymentAddress: {} as Address,
        isPaymentValidated: false,
        isSelected: true,
        isVisible: true,
        isEditing: true,
      },
    ]);
  };

  useEffect(() => {
    const selectedPayment = paymentMethods.find((pm) => pm.isSelected);

    setShowNewCard(selectedPayment?.paymentMethod.id === 0);

    if(isClick2PayCardSelected && selectedPayment && showClick2Pay && selectedPayment?.paymentMethod.typeID !== CLICK2PAY.typeId){
      Click2PayCardLoader.deselectC2PCard();
      setIsClick2PayCardSelected(false);
    }

    if (isThirdPartyPayment(selectedPayment?.paymentMethod.typeID)) {
      setShowNewCard(false);
      return;
    }
  }, [paymentMethods]);

  const isMethodDefault = (option: IPaymentOption) => {
    const { accountName } = option.paymentMethod;
    if (accountName === PAYPAL.name || accountName === SEZZLE.name) {
      return true;
    }
    return false;
  };

  const maxLength =
    paymentMethods.find((pm) => pm.isSelected)?.paymentMethod.typeID === 1
      ? 4
      : 3;

  const formik = useFormik({
    initialValues: {
      cvv: "",
    },
    validationSchema: Yup.object().shape({
      cvv: Yup.string()
        .matches(/^\d+$/, "CVV must be numeric")
        .min(maxLength, "CVV must be 3 or 4 digits")
        .max(maxLength, "CVV must be 3 or 4 digits")
        .required("CVV is required"),
    }),
    onSubmit: (values) => {
      // if (values.cvv.length === maxLength) {
      //   onValidCVV(values.cvv);
      // }
    },
  });

  const onCardEdit = (paymentId: number) => {
    // Update payment methods with the editing state

    const updatedPaymentMethods = paymentMethods.map((method) =>
      method.paymentMethod.id === paymentId
        ? {
          ...method,
          isEditing: !method.isEditing, // Toggle editing state for the selected payment method
        }
        : {
          ...method,
          isEditing: false,
          isVisible: isMethodDefault(method), // Ensure other methods are not in editing mode
        }
    );
    setPaymentMethods(updatedPaymentMethods);
  };

  const handleCancelNewCard = () => {
    setShowNewCard(false);

    // Find the previously selected payment method
    const previouslySelectedMethod = paymentMethods.find((pm) => pm.isSelected);

    // Filter out the temporary card (id === 0)
    let updatedPayments = paymentMethods
      .filter((pm) => pm.paymentMethod.id !== 0)
      .map((po) => ({
        ...po,
        isEditing: false,
        isSelected: false, // Reset selection for all
      }));

    let selectedPaymentId = previouslySelectedMethod?.paymentMethod.id;

    // If the previously selected method was a new card (id === 0), select the preferred method
    if (selectedPaymentId === 0) {
      const preferredMethod = updatedPayments.find(
        (po) => po.paymentMethod.preferred
      );
      if (preferredMethod) {
        selectedPaymentId = preferredMethod.paymentMethod.id;
      }
    }

    // Ensure only one payment method is selected
    updatedPayments = updatedPayments.map((po) => ({
      ...po,
      isSelected: po.paymentMethod.id === selectedPaymentId,
      isPaymentValidated: false,
      isVisible:
        po.paymentMethod.preferred ||
        po.paymentMethod.accountName === PAYPAL.name ||
        po.paymentMethod.accountName === SEZZLE.name ||
        false,
      isEditing: false,
    }));

    setTimeout(() => {
      setPaymentMethods(updatedPayments);
      setIsExpanded(false);
    }, 300);
  };

  const onAddNewCards = (payments: IPaymentOption[]) => {
    setTimeout(() => {
      setPaymentMethods(payments);
      setShowNewCard(false);
    }, 300);
  };

  const onCollapse = (id: number) => {
    const updatedPaymentMethods = paymentMethods
      .map((paymentMethod) => {
        if (paymentMethod.paymentMethod.id === id) {
          return {
            paymentMethod: {
              ...paymentMethod.paymentMethod,
              preferred: true,
            },
            paymentAddress: paymentMethod.paymentAddress,
            isSelected: true,
            isVisible: true,
          };
        }

        if (isThirdPartyPayment(paymentMethod.paymentMethod.typeID)) {
          return {
            ...paymentMethod,
            isSelected: false,
            isVisible: true,
          };
        }

        // when selected paypal or sezzle, set editing false
        if (id === -1001 || id === -1002) {
          updatePaymentTypeId(id);
          return {
            ...paymentMethod,
            isPaymentValidated: false,
            isSelected: paymentMethod.paymentMethod.id === id,
            isVisible: paymentMethod.paymentMethod.preferred || false,
            isEditing: false,
          };
        }
        return {
          ...paymentMethod,
          paymentMethod: {
            ...paymentMethod.paymentMethod,
            preferred: false,
          },
          isSelected: false,
          isVisible: false,
        };
      })
      .filter((method) => method.paymentMethod.id !== 0);

    setTimeout(() => {
      formik.resetForm();
      updatePaymentTypeId(
        updatedPaymentMethods.find((pm) => pm.paymentMethod.id === id)
          ?.paymentMethod.typeID || 0
      );
      console.log("updatedPaymentMethods", updatedPaymentMethods);
      setPaymentMethods(updatedPaymentMethods as IPaymentOption[]);
      setShowNewCard(false);
      setIsExpanded(false);
    }, 300);
  };

  const setCVVFieldValue = (cvv: string) => {
    formik.setFieldValue("cvv", cvv);
  };

  const getSavedCreditCardsFromWallet = paymentMethods.filter(
      (pm) =>
          pm.paymentMethod.id > 0 &&
          creditCardTypeIds.includes(pm.paymentMethod.typeID)
  )

  const showShouldToggleAccordian = getSavedCreditCardsFromWallet.length > 1;

  const updateCvvError = (error: string) => {
    formik.setFieldValue("cvvError", error, false);
  };
  return (
    <FormikProvider value={formik}>
      <div className="pm-main-container">
        <div className="pm-container" id="pm-main">
          <div className="pm-title-container">
            <FormHeading title="Payment Method" />
            {showShouldToggleAccordian && (
              <div className="pm-show-card" onClick={toggleAccordion}>
                <div>{isExpanded ? "Hide other cards" : "See other cards"}</div>
                <Back
                  className={`accordion ${isExpanded ? "open" : "close"}`}
                />
              </div>
            )}
          </div>
          <div className="pm-sub-container">
            {paymentMethods
              .filter((method) => method.isVisible)
              .map((paymentOption, index) => (
                <PaymentOption
                  key={paymentOption.paymentMethod.id}
                  paymentOption={paymentOption}
                  index={index}
                  shopperId={shopperId}
                  onCardEdit={onCardEdit}
                  handleCancelNewCard={handleCancelNewCard}
                  onAddNewCards={onAddNewCards}
                  updatePaymentTypeId={updatePaymentTypeId}
                  onCollapse={onCollapse}
                  formik={formik}
                  updateCvvError={updateCvvError}
                  setCVVFieldValue={setCVVFieldValue}
                />
              ))}
            {showClick2Pay && (
              <PaymentOptionClick2Pay pcid={pcid} order={order} />
            )}
            {!showNewCard && (
              <div className="checkout-add-card" onClick={onAddNewCard}>
                <div className="checkout-add-card-text">
                  <div>
                    <Add />
                  </div>
                  <div>Add New Card</div>
                </div>
                <div>
                  {order?.paymentMethods
                    ?.filter((pm) => pm.visible)
                    ?.map(
                      (pm) =>
                        pm.imageTag && (
                          <img
                            key={pm.typeID}
                            className="checkout-add-new-card "
                            src={getVisibleCardOptionsImages(pm.imageTag)}
                          />
                        )
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
        <TextUpdates pcid={pcid} siteId={siteId} />
      </div>
    </FormikProvider>
  );
};

export default PaymentMethod;
