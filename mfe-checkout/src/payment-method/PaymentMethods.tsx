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
import withLoader from "../hoc/withLoader";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import { PaymentOption } from "../payment-method-option/PaymentMethodOption";
import { IPaymentOption, orderAtom, paymentMethodsAtom } from "../store";
import { TextUpdates } from "../text-updates/TextUpdates";
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import "./PaymentMethods.scss";
import * as Yup from "yup";
import {
  CLICK2PAY,
  isThirdPartyPayment,
  PAYPAL,
  SEZZLE,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { SiteFlags } from "../interfaces/SiteFlags";
import { portalApiData } from "../checkout/portalAtom";
import { orderHasAutoshipItems } from "../utils/OrderUtils";
import { FormikProvider, useFormik } from "formik";

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
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");

  const [order] = useAtom(orderAtom);

  const shouldShowClick2Pay = order?.paymentMethods.some(
    (method) => method.typeID === CLICK2PAY.typeId
  );
  const [showClick2Pay, setShowClick2Pay] = useState(shouldShowClick2Pay);

  const shouldShowPaypal = order?.paymentMethods.some(
    (method) => method.typeID === PAYPAL.typeId && method.visible
  );

  const shouldShowSezzle = order?.paymentMethods.some(
    (method) => method.typeID === SEZZLE.typeId && method.visible
  );

  const [showNewCard, setShowNewCard] = useState<boolean>(false);
  const [portalData] = useAtom(portalApiData(shopperId));
  const [thirdPartySiteFlagData, setThirdPartySiteFlagData] = useState<
    SiteFlags[]
  >([]);

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

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );

      try {
        const response = await fetchShoppersPaymentMethods(shopperId);

        let staticMethods = paymentMethods;
        if (!shouldShowSezzle) {
          staticMethods = staticMethods.filter(
            (method) => method.paymentMethod.typeID !== SEZZLE.typeId
          );
        }

        if (!shouldShowPaypal) {
          staticMethods = staticMethods.filter(
            (method) => method.paymentMethod.typeID !== PAYPAL.typeId
          );
        }

        const paymentOptions = response.map((paymentMethod) => {
          const isPreferred = paymentMethod.preferred;

          if (isPreferred) {
            staticMethods = staticMethods.map((sm) => ({
              ...sm,
              isSelected: false,
            }));
          }

          // Handle single response case
          if (response.length === 1) {
            return {
              paymentMethod,
              paymentAddress: addressMap.get(
                paymentMethod.addressId.toString()
              ),
              isVisible: true,
              isSelected: paymentMethod.preferred,
            } as IPaymentOption;
          }

          return {
            paymentMethod,
            paymentAddress: addressMap.get(paymentMethod.addressId.toString()),
            isVisible: isPreferred,
            isSelected: isPreferred, // Ensure only one selection later
          } as IPaymentOption;
        });

        let updatedPaymentOptions = [...paymentOptions, ...staticMethods];

        if (isPaypalOrderSuccess) {
          const paypalDetails = await generatePayPalTransactionDetails(
            shopperId,
            token,
            true,
            false
          );

          updatedPaymentOptions = updatedPaymentOptions.map((paymentOption) => {
            if (paymentOption.paymentMethod.typeID === PAYPAL.typeId) {
              return {
                ...paymentOption,
                isSelected: true,
              };
            } else {
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
        }, 300);
      } catch (error) {
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
        }
      }
    };

    if (addresses && paymentMethods.length < 3) {
      fetchShoppersSavedPayments(shopperId, addresses);
    }
  }, [shopperId, addresses]);

  useEffect(() => {
    //sezzle rules dependent on site
    const sezzleSiteFlag = getSiteFlagDataForType(SEZZLE.siteflagTypeId || 0);
    if (!sezzleSiteFlag?.active) {
      updateVisibilityOfPaymentMethod(SEZZLE.typeId, false);
      return;
    }
    //sezzle rules dependent on portal
    if (portalData?.hasItransact) {
      if (sezzleSiteFlag.auxDataText) {
        const jsonData = JSON.parse(sezzleSiteFlag.auxDataText);
        if (!jsonData.enableForItransact) {
          updateVisibilityOfPaymentMethod(SEZZLE.typeId, false);
          return;
        }
      }
    }
    //sezzle rules dependent on order, min order, autohship
    //filter payment method types from order response
    if (order) {
      const isSezzleInAcceptedPayments =
        order.paymentMethods.filter((method) => method.typeID === SEZZLE.typeId)
          .length > 0;
      let isAutoshipAllowed = false;
      if (sezzleSiteFlag?.auxDataText) {
        const jsonData = JSON.parse(sezzleSiteFlag.auxDataText);
        isAutoshipAllowed = jsonData.supportedForAutoship;
      }
      if (!isAutoshipAllowed && orderHasAutoshipItems(order)) {
        updateVisibilityOfPaymentMethod(SEZZLE.typeId, false);
        return;
      }
      updateVisibilityOfPaymentMethod(
        SEZZLE.typeId,
        isSezzleInAcceptedPayments
      );
    }
  }, [order, thirdPartySiteFlagData, portalData]);

  const getSiteFlagDataForType = (siteflagTypeId: number) => {
    if (thirdPartySiteFlagData) {
      return thirdPartySiteFlagData.find(
        (item: any) => item.flagID === siteflagTypeId
      );
    }
    return null;
  };

  const updateVisibilityOfPaymentMethod = (
    paymentTypeId: number,
    isVisible: boolean
  ) => {
    const updatedPaymentOptions = paymentMethods.map((paymentOption) => {
      if (paymentOption.paymentMethod.typeID === paymentTypeId) {
        return {
          ...paymentOption,
          isVisible: isVisible,
        };
      } else {
        return {
          ...paymentOption,
        };
      }
    });
    setPaymentMethods(updatedPaymentOptions);
  };

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      setPaymentMethods(
        paymentMethods.map((item) => ({
          ...item,
          isSelected: false,
        }))
      );
      updatePaymentTypeId(CLICK2PAY.typeId);
    };
    document.addEventListener(
      "c2pSelectedCard",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

  const toggleAccordion = () => {
    const paymentString = ["Paypal"];

    if (shouldShowSezzle) {
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
        if (shouldShowSezzle) {
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
    setShowNewCard(true);
    const hasTemporaryCard = paymentMethods.some(
      (paymentOption) => paymentOption.paymentMethod.id === 0
    );

    if (hasTemporaryCard) {
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
    });

    // while adding new card makeing new credit card as selected
    const updatedPaymentOptions = paymentMethods.map((paymentOption) => ({
      ...paymentOption,
      isSelected: false,
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
    const isAddingNewCard = paymentMethods.find(
      (pm) => pm.paymentMethod.id === 0
    );
    setShowNewCard(isAddingNewCard ? true : false);
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

    let updatedPayments = paymentMethods
      .filter((pm) => pm.paymentMethod.id !== 0)
      .map((po) => ({
        ...po,
        isEditing: false,
        isSelected: false, // Reset selection
      }));

    // Check if any payment method is already selected
    const selectedPayment = updatedPayments.find((pm) => pm.isSelected);

    if (!selectedPayment) {
      // If no selection, set preferred card as selected
      updatedPayments = updatedPayments.map((po) => ({
        ...po,
        isSelected: po.paymentMethod.preferred || false,
        isPaymentValidated: false,
        isVisible:
          po.paymentMethod.preferred ||
          po.paymentMethod.accountName === PAYPAL.name ||
          po.paymentMethod.accountName === SEZZLE.name ||
          false,
        isEditing: false,
      }));
    } else {
      updatedPayments = updatedPayments.map((po) => ({
        ...po,
        isSelected: po.paymentMethod.id === selectedPayment.paymentMethod.id,
        isPaymentValidated: false,
        isVisible:
          po.paymentMethod.accountName === PAYPAL.name ||
          po.paymentMethod.accountName === SEZZLE.name ||
          false,
        isEditing: false,
      }));
    }

    setTimeout(() => {
      setPaymentMethods(updatedPayments);
      setIsExpanded(false);
    }, 300);
  };

  const onAddNewCards = (payments: IPaymentOption[]) => {
    setTimeout(() => {
      setPaymentMethods(payments);
    }, 300);
  };

  const onCollapse = (id: number) => {
    const updatedPaymentMethods = paymentMethods.map((paymentMethod) => {
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

      if (id === -1001 || id === -1002) {
        return {
          ...paymentMethod,
          isPaymentValidated: false,
          isSelected: paymentMethod.paymentMethod.id === id,
          isVisible: paymentMethod.paymentMethod.preferred || false,
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
    });

    setTimeout(() => {
      formik.resetForm();
      updatePaymentTypeId(
        updatedPaymentMethods.find((pm) => pm.paymentMethod.id === id)
          ?.paymentMethod.typeID || 0
      );
      setPaymentMethods(updatedPaymentMethods as IPaymentOption[]);
      setIsExpanded(false);
    }, 300);
  };

  const setCVVFieldValue = (cvv: string) => {
    formik.setFieldValue("cvv", cvv);
  };

  return (
    <FormikProvider value={formik}>
      <div className="pm-main-container">
        <div className="pm-container" id="pm-main">
          <div className="pm-title-container">
            <FormHeading title="Payment Method" />
            {paymentMethods.length >= 1 && (
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
                  key={index}
                  paymentOption={paymentOption}
                  index={index}
                  shopperId={shopperId}
                  onCardEdit={onCardEdit}
                  handleCancelNewCard={handleCancelNewCard}
                  onAddNewCards={onAddNewCards}
                  updatePaymentTypeId={updatePaymentTypeId}
                  onCollapse={onCollapse}
                  formik={formik}
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
                  <img className="checkout-add-new-card" src={CardOptions} />
                </div>
              </div>
            )}
          </div>
        </div>
        <TextUpdates />
      </div>
    </FormikProvider>
  );
};

export default withLoader(PaymentMethod);
