import { useAtom } from "jotai";
import React, {useEffect, useMemo, useState} from "react";
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
import { createPaymentMethod } from "../utils/helpers/GeneratePaymentMethod";
import "./PaymentMethods.scss";
import * as Yup from "yup";
import {
  CLICK2PAY,
  creditCardTypeIds,
  isThirdPartyPayment,
  PAYPAL, PAYPAL_RECURRING,
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
import { RadioButton } from "../component/RadioButton/RadioButton";
import { useContentStrings } from "../hooks/useContentStrings";
import { isSezzleSelectedPayment } from "../utils/helpers/SezzleHelper";
import {
  convertPaymentMethodsToPaymentOptions,
  createNewCardOption,
  getSelectedPaymentOption,
  isNewCardInPaymentOptions, isPaymentMethodExistingInPaymentOption,
  isSelectedPaymentInAllowedOrderPayments, returnPaymentOptionsWithDefaultSelection,
  updatedPaymentOptionsWithSelectedType
} from "../utils/types/PaymentOptionUtils";
import { Spinner } from "../component/Spinner/Spinner";

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
  siteId: string;
  pcid: string;
  portalId: string;
  isVisible: boolean;
  payments: IPaymentOption[];
  updatePaymentTypeId: (newValue: number) => void;
  updateOrderErrorMessage: (newMessage: string) => void;
  isGuest: boolean;
}

const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  isVisible,
  pcid,
  payments,
  updatePaymentTypeId,
  updateOrderErrorMessage,
  portalId,
  isGuest,
}) => {
  // initial payment methods
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const { getString } = useContentStrings();
  const [isExpanded, setIsExpanded] = useState(false);

  // addresses for user wallet
  const { addresses } = useShopperEWalletAddresses(shopperId || "");

  const [order] = useAtom(orderAtom);

  const shouldShowClick2Pay = order?.paymentMethods.some(
    (method) => method.typeID === CLICK2PAY.typeId
  );
  const [showClick2Pay, setShowClick2Pay] = useState(shouldShowClick2Pay);

  const [isPaymentsFetched, setIsPaymentsFetched] = useState<boolean>(false);

  const [showNewCard, setShowNewCard] = useState<boolean>(false);
  const portalKey = useMemo(() => JSON.stringify({ shopperId, portalId }), [shopperId, portalId]);
  const [portalData] = useAtom(portalApiData(portalKey));
  const [thirdPartySiteFlagData, setThirdPartySiteFlagData] = useState<
    SiteFlags[]
  >([]);
  const [isClick2PayCardSelected, setIsClick2PayCardSelected] =
    useState<boolean>(false);
  
  // To check mobile width 
  const isMobileDevice = () => window.innerWidth <= 768;

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
          baToken: params.get("ba_token"),
        };
      };

      // checking paypal order success
      const { token, payerId, baToken } = getQueryParams();

      const isPaypalOrderSuccess = token && payerId;
      const addressMap = new Map<string, Address>();
      const isPaypalCallback = !!token;
      const isPaypalRecurringCallBack = !!baToken;
      const showPayPalSelected = isPaypalCallback || isPaypalRecurringCallBack;

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );

      try {
        let staticMethods = paymentMethods;

        // case when user does not have any payment methods
        if (!payments) {
          if (isPaymentsFetched) return;

          if (showPayPalSelected) {
            staticMethods = paymentMethods.map((method) => {
              const paypalPaymentType = isPaypalRecurringCallBack ? PAYPAL_RECURRING : PAYPAL;
              if (method.paymentMethod.typeID === paypalPaymentType.typeId) {
                updatePaymentTypeId(method.paymentMethod.typeID);
                return { ...method, isSelected: true };
              }
              return { ...method, isSelected: false };
            });
          } else {
            const isNewCardAlreadyPresent = isNewCardInPaymentOptions(paymentMethods);
        
            if (!isNewCardAlreadyPresent) {
        
              staticMethods = [
                createNewCardOption(),
                ...paymentMethods.map((method) => ({
                  ...method,
                  isSelected: false,
                })),
              ];
            } else {
              staticMethods = paymentMethods.map((method) => ({
                ...method,
                isSelected: method.paymentMethod.typeID === 9 && method.paymentMethod.id === 0,
              }));
            }
          }

          setPaymentMethods(handleThirdPartyPaymentVisibility(staticMethods));
          setIsPaymentsFetched(true);
          return;
        }

        const paymentIds = order?.paymentMethods.map(
          (orderPayment) => orderPayment.typeID
        );

        const staticMethodIds = new Set(
          staticMethods.map((sm) => sm.paymentMethod?.id)
        );

        let paymentOptions = payments
          .filter(
            (paymentMethod) =>
              !staticMethodIds.has(paymentMethod.id) &&
              paymentIds?.includes(paymentMethod.typeID)
          ) // Exclude duplicates
          .map((paymentMethod) => {
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
              paymentAddress: addressMap.get(
                paymentMethod.addressId.toString()
              ),
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

          // when paypal is selected and user is on mobile scroll to the end of the screen
          if (isMobileDevice()) {
            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }, 100); // delay to wait for re-render
          }
          
          updatedPaymentOptions = updatedPaymentOptions.map((paymentOption) => {
            const paypalPaymentType = isPaypalRecurringCallBack ? PAYPAL_RECURRING : PAYPAL;
            if (paymentOption.paymentMethod.typeID === paypalPaymentType.typeId) {
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
          setPaymentMethods(handleThirdPartyPaymentVisibility(updatedPaymentOptions));
          setIsPaymentsFetched(true);
        }, 300);
      } catch (error) {
        console.log("Error fetching payment methods", error);
        // in case fetching payment api fails and user has a successful paypal transaction
        // let user proceed with paypal
        if (isPaypalOrderSuccess) {
          const ppShopperId = isGuest ? cartId : shopperId;
          await generatePayPalTransactionDetails(ppShopperId, token, true, false);

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

          setPaymentMethods(handleThirdPartyPaymentVisibility(updatedPaymentOptions));
          setIsPaymentsFetched(true);
        }
      }
    };

    if(isGuest){
      setPaymentMethods(handleThirdPartyPaymentVisibility(paymentMethods));
      setIsPaymentsFetched(true);
    }else if (addresses && paymentMethods.length < 3) {
      fetchShoppersSavedPayments(shopperId, addresses);
    }
  }, [shopperId, addresses]);

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
          baToken: params.get("ba_token"),
        };
      };

      // checking paypal order success
      const { token, payerId, baToken } = getQueryParams();

      const isPaypalOrderSuccess = token && payerId;
      const addressMap = new Map<string, Address>();
      const isPaypalCallback = !!token;
      const isPaypalRecurringCallBack = !!baToken;
      const showPayPalSelected = isPaypalCallback || isPaypalRecurringCallBack;

      Object.keys(addresses).map((id) =>
        addressMap.set(id, addresses[parseInt(id)] as Address)
      );

      try {
        let staticMethods = paymentMethods;

        // case when user does not have any payment methods
        if (!payments) {
          if (isPaymentsFetched) return;

          if (showPayPalSelected) {
            staticMethods = paymentMethods.map((method) => {
              const paypalPaymentType = isPaypalRecurringCallBack ? PAYPAL_RECURRING : PAYPAL;
              if (method.paymentMethod.typeID === paypalPaymentType.typeId) {
                updatePaymentTypeId(method.paymentMethod.typeID);
                return { ...method, isSelected: true };
              }
              return { ...method, isSelected: false };
            });
          } else {
            const isNewCardAlreadyPresent = isNewCardInPaymentOptions(paymentMethods);

            if (!isNewCardAlreadyPresent) {

              staticMethods = [
                createNewCardOption(),
                ...paymentMethods.map((method) => ({
                  ...method,
                  isSelected: false,
                })),
              ];
            } else {
              staticMethods = paymentMethods.map((method) => ({
                ...method,
                isSelected: method.paymentMethod.typeID === 9 && method.paymentMethod.id === 0,
              }));
            }
          }

          setPaymentMethods(handleThirdPartyPaymentVisibility(staticMethods));
          setIsPaymentsFetched(true);
          return;
        }

        const paymentIds = order?.paymentMethods.map(
          (orderPayment) => orderPayment.typeID
        );

        const staticMethodIds = new Set(
          staticMethods.map((sm) => sm.paymentMethod?.id)
        );

        let paymentOptions = payments
          .filter(
            (paymentMethod) =>
              !staticMethodIds.has(paymentMethod.id) &&
              paymentIds?.includes(paymentMethod.typeID)
          ) // Exclude duplicates
          .map((paymentMethod) => {
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
              paymentAddress: addressMap.get(
                paymentMethod.addressId.toString()
              ),
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

          // when paypal is selected and user is on mobile scroll to the end of the screen
          if (isMobileDevice()) {
            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
              });
            }, 100); // delay to wait for re-render
          }

          updatedPaymentOptions = updatedPaymentOptions.map((paymentOption) => {
            const paypalPaymentType = isPaypalRecurringCallBack ? PAYPAL_RECURRING : PAYPAL;
            if (paymentOption.paymentMethod.typeID === paypalPaymentType.typeId) {
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
          setPaymentMethods(handleThirdPartyPaymentVisibility(updatedPaymentOptions));
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

          setPaymentMethods(handleThirdPartyPaymentVisibility(updatedPaymentOptions));
          setIsPaymentsFetched(true);
        }
      }
    };

    if (isVisible && addresses && !isPaymentsFetched) {
      fetchShoppersSavedPayments(shopperId, addresses);
    }
  }, [isVisible, addresses, isPaymentsFetched]);

  const handleThirdPartyPaymentVisibility = (paymentOptions : IPaymentOption[]) : IPaymentOption[] => {
    const shouldShowPaypal = order?.paymentMethods.some(
        (method) => method.type.toLowerCase() === PAYPAL.name.toLowerCase()
    );

    const showPaypalRecurring = order?.paymentMethods.some(
        (method) => method.typeID === PAYPAL_RECURRING.typeId
    );

    if (!isSezzleAllowed()) {
      paymentOptions = paymentOptions.filter(
          (method) => method.paymentMethod.typeID !== SEZZLE.typeId
      );
    }

    if (!shouldShowPaypal) {
      paymentOptions = paymentOptions.filter(
          (method) => method.paymentMethod.typeID !== PAYPAL.typeId
      );
    }

    if (!showPaypalRecurring) {
      paymentOptions = paymentOptions.filter(
          (method) => method.paymentMethod.typeID !== PAYPAL_RECURRING.typeId
      );
    }

    //if sezzle was gone and now order allows it, add it back
    if(isSezzleAllowed() && !paymentOptions.some(
        (method) => method.paymentMethod.typeID === SEZZLE.typeId
    )){
      const sezzlePayment =
          initialPaymentMethods.find(
              (method) => method.paymentMethod.typeID === SEZZLE.typeId
          ) || null;
      if (sezzlePayment) {
        paymentOptions = [...paymentMethods, sezzlePayment];
      }
    }

    return paymentOptions;
  };

  useEffect(() => {
    let updatedPMs = handleThirdPartyPaymentVisibility(paymentMethods);

    if(isSezzleSelectedPayment(location.search)){
      updatedPMs = updatedPaymentOptionsWithSelectedType(updatedPMs, SEZZLE.typeId);
      updatePaymentTypeId(SEZZLE.typeId);
    }

    if(order){
      if(!isSelectedPaymentInAllowedOrderPayments(updatedPMs, order.paymentMethods)){
        updatedPMs = returnPaymentOptionsWithDefaultSelection(updatedPMs);
        const selectedPaymentTypeId = getSelectedPaymentOption(updatedPMs);
        if(selectedPaymentTypeId){
          updatePaymentTypeId(selectedPaymentTypeId.paymentMethod.typeID);
        } else if (isPaymentsFetched && !selectedPaymentTypeId){
          const newCartPM = createNewCardOption();
          updatedPMs.push(newCartPM);
          updatePaymentTypeId(newCartPM.paymentMethod.typeID);
        }
      }
    }

    setPaymentMethods(updatedPMs);
  }, [order, isPaymentsFetched, thirdPartySiteFlagData]);

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
      filteredPaymentMethods = handleThirdPartyPaymentVisibility(filteredPaymentMethods);

      const hasSavedPayments = payments && payments.length > 0;
      if(hasSavedPayments && !isPaymentMethodExistingInPaymentOption(payments, filteredPaymentMethods)){
        //add shopper saved pms if they are missing
        filteredPaymentMethods = [...convertPaymentMethodsToPaymentOptions(payments), ...filteredPaymentMethods];
      }

      setPaymentMethods(
          filteredPaymentMethods.map((item) => ({
            ...item,
            isSelected: false, //deselect all PMs
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
      document.removeEventListener(
        "c2pSelectedCard",
        handleDeselectPaymentMethodsEvent
      );
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
      createNewCardOption(),
    ]);
  };

  useEffect(() => {
    const selectedPayment = paymentMethods.find((pm) => pm.isSelected);

    setShowNewCard(selectedPayment?.paymentMethod.id === 0);

    if (
      isClick2PayCardSelected &&
      selectedPayment &&
      showClick2Pay &&
      selectedPayment?.paymentMethod.typeID !== CLICK2PAY.typeId
    ) {
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

  const getValidationSchema = (paymentTypeId: number) =>
    Yup.object().shape({
      cvv: Yup.string()
        .matches(/^\d+$/, getString("cvvMustBeNumeric"))
        .test("cvv-length", function (value) {
          const expectedLength = paymentTypeId === 1 ? 4 : 3;

          if (!value || value.length !== expectedLength) {
            return this.createError({
              message:
                paymentTypeId === 1
                  ? getString("cvvMustBe4Digits")
                  : getString("cvvMustBe3Digits"),
            });
          }

          return true;
        })
        .required(getString("cvvIsRequired")),
    });

  const formik = useFormik({
    initialValues: {
      cvv: "",
    },
    validationSchema: getValidationSchema(
      paymentMethods.find((pm) => pm.isSelected)?.paymentMethod.typeID || 0
    ),
    onSubmit: (values) => {
      // No need to check maxLength separately, as validation already ensures correct length
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
    console.log("payments", payments);
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
        if (id === -1001 || id === -1002 || id === -1003) {
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

      setPaymentMethods(updatedPaymentMethods as IPaymentOption[]);
      setShowNewCard(false);
      setIsExpanded(false);
    }, 300);
  };

  const setCVVFieldValue = (cvv: string) => {
    formik.setFieldValue("cvv", cvv);
  };

  const validCreditCardTypeIds = order?.paymentMethods.map(
    (pm) => pm.typeID
  );

  const getSavedCreditCardsFromWallet = paymentMethods.filter(
    (pm) =>
      pm.paymentMethod.id > 0 &&
      validCreditCardTypeIds?.includes(pm.paymentMethod.typeID)
  );

  const showShouldToggleAccordian = getSavedCreditCardsFromWallet.length > 1;

  const updateCvvError = (error: string) => {
    formik.setFieldValue("cvvError", error, false);
  };
  return (
    <FormikProvider value={formik}>
      {!isPaymentsFetched ? <Spinner/> :<div className="pm-main-container">
        <div className="pm-container" id="pm-main">
          <div className="pm-title-container">
            <FormHeading title={getString("paymentMethod") as string} />
            {showShouldToggleAccordian && (
              <div className="pm-show-card" onClick={toggleAccordion}>
                <div>{isExpanded ? getString('hideOtherCards') : getString('seeOtherCards')}</div>
                <Back
                  className={`mfe-accordion ${isExpanded ? "open" : "close"}`}
                />
              </div>
            )}
          </div>
          <div className="pm-sub-container">
            {paymentMethods
              .filter((method) => method.isVisible)
              .map((paymentOption, index) => {
                // Only render credit cards first
                if (
                  creditCardTypeIds.includes(paymentOption.paymentMethod.typeID)
                ) {
                  return (
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
                      updateOrderErrorMessage={updateOrderErrorMessage}
                      siteId={siteId}
                      pcid={pcid}
                      isGuest={isGuest}
                    />
                  );
                }
                return null;
              })}

            {/* Add New Card section */}
            {!showNewCard && (
              <div className="checkout-add-card" onClick={onAddNewCard}>
                <div className="checkout-add-card-text">
                  <RadioButton id={"39812031823"} />
                  <div>{getString("addNewCard")}</div>
                </div>
                <div className="checkout-add-new-card-image">
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

            {/* Render non-credit card payment methods (PayPal, Sezzle, etc.) */}
            {paymentMethods
              .filter((method) => method.isVisible)
              .map((paymentOption, index) => {
                if (
                  !creditCardTypeIds.includes(
                    paymentOption.paymentMethod.typeID
                  )
                ) {
                  return (
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
                      updateOrderErrorMessage={updateOrderErrorMessage}
                      siteId={siteId}
                      pcid={pcid}
                      isGuest={isGuest}
                    />
                  );
                }
                return null;
              })}

            {showClick2Pay && (
              <PaymentOptionClick2Pay pcid={pcid} order={order} isGuest={isGuest} />
            )}
          </div>
        </div>
      </div>}
    </FormikProvider>
  );
};

export default PaymentMethod;
