import React, { useEffect, useRef, useState } from "react";
import Click2PayInitializer from "./Click2PayInitializer";
import Click2PayCards from "./Click2PayCards";
import Click2PayNewCard from "./Click2PayNewCard";
import { initiateValidation } from "./Click2PayOTP";
import "./PaymentOptionClick2Pay.scss";
import { Add } from "../assets/icons/Add";
import { Warn } from "../assets/icons/Warn";
import { ShopperSavedPayments } from "../interfaces/ShopperSavedPayments";
import { Button } from "../component/Button/Button";
import { Click2PayData } from "./Click2PayData";
import { creditCards } from "../payment-method/PaymentType";
import Click2PayCardLoader from "./Click2PayCardLoader";
import { GET_C2P_DPAID } from "../utils/urlResolver";
import { Order } from "../interfaces/Order";
import { CardInputs } from "../payment-method/card-information/CardInputs";
import { Formik } from "formik";
import { creditCardSchema } from "../validation/creditcardSchema";
import * as Yup from "yup";
import { useContentStrings } from "../hooks/useContentStrings";
import { useAtom } from "jotai/index";
import { customerApiData } from "../checkout/customerAtom";

interface IClick2PayProps {
  pcid: string;
  order?: Order;
}

const c2pCustomerData: Click2PayData = {
  mcc: "5963",
  email: "",
  transactionAmount: 0,
  hasAutoship: false,
  mobilePhone: "",
  cardBrands: ["mastercard", "visa", "discover", "amex"],
  address: {
    first: "",
    last: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    state: "",
    zip: "",
  },
};



export const PaymentOptionClick2Pay: React.FC<IClick2PayProps> = ({
  pcid,
  order,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSavedCards, setHasSavedCards] = useState(false);
  const [cardData, setCardData] = useState([]);
  const [c2pData, setC2pData] = useState(c2pCustomerData);
  const [customerData] = useAtom(customerApiData(pcid));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const { getString } = useContentStrings();
  const cardBrandsString = c2pData.cardBrands.join(",");
  const shopperSavedPayment: ShopperSavedPayments = {
    //used to prefill address for new c2p card
    id: 0,
    image: "",
    expirationDate: "",
    cardMask: "",
    preferred: false,
    type: 0,
    address: c2pData.address,
    accountName: "",
  };

  const validationSchema = Yup.object().shape({
    cardInfo: creditCardSchema(getString),
  });

  useEffect(() => {
    if (order) {
      const acceptedCreditCards = order.paymentMethods.filter(
        (method) => method.visible
      );
      const acceptedCardNameList: string[] = acceptedCreditCards
        .map(
          (accepted) =>
            creditCards.find((card) => card.typeId === accepted.typeID)?.altName
        )
        .filter((altName): altName is string => Boolean(altName));
      setC2pData((prevData) => ({
        ...prevData,
        cardBrands: acceptedCardNameList,
        transactionAmount: order ? order.totals.price : 0,
      }));
    }
  }, [order]);

  useEffect(() => {
    if (c2pData) {
      if (customerData) {
        setC2pData((prevData) => ({
          ...prevData,
          email: customerData.email_address,
          mobilePhone: customerData.cell_phone,
          address: {
            ...c2pCustomerData.address,
            first: customerData.first_name,
            last: customerData.last_name,
            address1: customerData.home_address?.address_1,
            address2: customerData.home_address?.address_2,
            address3: customerData.home_address?.address_3,
            city: customerData.home_address?.city,
            state: customerData.home_address?.state,
            zip: customerData.home_address?.postal_code,
          },
        }));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("c2pData", JSON.stringify(c2pData));
  }, [c2pData]);

  useEffect(() => {
    const waitForC2PLibrary = () => {
      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          // @ts-ignore
          if (window.Click2Pay) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    };

    waitForC2PLibrary().then(() => {
      initializeClick2Pay();
    });

    const initParams = {
      srcDpaId: `${GET_C2P_DPAID()}`,
      dpaTransactionOptions: {
        dpaLocale: "en_US",
        transactionAmount: {
          transactionAmount: Number(c2pData.transactionAmount.toFixed(2)),
          transactionCurrencyCode: "USD",
        },
        merchantCategoryCode: `${c2pData.mcc}`,
        merchantCountryCode: "US",
        dpaBillingPreference: "FULL",
        consumerNameRequested: true,
        confirmPayment: false,
        paymentOptions: [
          {
            dynamicDataType: "NONE",
          },
        ],
      },
      services: ["INLINE_CHECKOUT"],
      checkoutExperience: "WITHIN_CHECKOUT",
      cardBrands: c2pData.cardBrands,
      dpaData: {
        dpaPresentationName: "SHOP.COM",
        dpaName: "SHOP.COM",
      },
    };

    const initializeClick2Pay = async () => {
      // @ts-ignore
      window.c2pInstance = new Click2Pay();
      // @ts-ignore
      await Click2PayInitializer.initHandler(window.c2pInstance, initParams);
      // @ts-ignore
      Click2PayCards.getUserCards(window.c2pInstance)
        .then((response: any) => {
          const hasCookiedCards = response.length > 0;
          setHasSavedCards(
            response.consumerPresent === true || hasCookiedCards
          );
          if (hasCookiedCards) {
            setCardData(response);
          }
        })
        .catch((error: { message: string }) => {
          console.error("getUserCards error: " + error.message);
        });
    };
    waitForC2PLibrary();
  }, []);

  useEffect(() => {
    if (cardData.length > 0) {
      // @ts-ignore
      Click2PayCardLoader.loadSRCCardsOnPage(
        cardData,
        window.c2pInstance,
        true,
        false,
        true
      );
    }
  }, [cardData]);

  useEffect(() => {
    document.addEventListener("c2pError", (event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      setErrorMessage(customEvent.detail.message);
    });
  }, []);

  useEffect(() => {
    document.addEventListener("c2pSignOut", (event) => {
      setHasSavedCards(false);
    });
  }, []);

  const initiateOTPValidation = () => {
    // @ts-ignore
    initiateValidation(window.c2pInstance);
  };

  const showLearnMoreButton = () => {
    setShowLearnMoreModal(true);
  };

  const closeLearnMoreButton = () => {
    setShowLearnMoreModal(false);
  };

  const addNewClick2PayCard = () => {
    Click2PayNewCard.openAddCardOverlay();
  };

  useEffect(() => {
    if (showLearnMoreModal && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [showLearnMoreModal]);

  const closeAddCardOverlay = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    Click2PayNewCard.closeAddCardOverlay();
  };

  const saveNewCard = (values: any) => {
    // @ts-ignore
    Click2PayNewCard.addCardToClick2Pay(window.c2pInstance, values);
  };

  const handleCloseErrorMessage = () => {
    setErrorMessage("");
  };

  return (
    <div className="payment-option-container">
      <div className="js-payment-promo-c2p"></div>
      <div className="checkout-method-click-to-pay">
        {hasSavedCards ? (
          <div className="checkout-method-save-information">
            <div className="js-c2p-container click-to-pay">
              <div className="js-c2p-access-cards-msg click-to-pay">
                <div className="checkout-method-click-to-pay-text">
                  {getString("payWithSavedCards")}
                </div>
                <button
                  className="checkout-method-click-to-pay-text checkout-method-click-to-pay-text--black click-to-pay__btn"
                  type="button"
                  onClick={() => initiateOTPValidation()}
                >
                  {getString("clickToAccessCards")}
                </button>
              </div>
              <src-card-list
                card-brands={cardBrandsString}
                display-preferred-card="true"
                card-selection-type="radioButton"
                display-sign-out="false"
              />
              <div
                className="js-c2p-empty-card-list-msg"
                style={{ display: "none" }}
              >
                <div className="checkout-method-click-to-pay-text click-to-pay__warn">
                  <Warn />
                  <p className="click-to-pay__warn-text">
                    {getString("noCardsInClickToPayWallet")}
                  </p>
                </div>
              </div>
              <div
                className="js-c2p-add-new-card click-to-pay__btn-container"
                style={{ display: "none" }}
              >
                <div>
                  <Add />
                </div>
                <button
                  className="click-to-pay__btn"
                  type="button"
                  onClick={() => addNewClick2PayCard()}
                >
                  {getString("clickToPay-addNewCard")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="js-c2p-container">
            <div className="checkout-method-click-to-pay-container">
              <div className="checkout-method-click-to-pay-container js-c2p-save-card-msg">
                <div
                  className="checkout-method-save-information__add-btn"
                  onClick={() => addNewClick2PayCard()}
                >
                  <Add />
                </div>
                <div className="checkout-method-save-information">
                  <div>
                    <div
                      className="checkout-add-card-text"
                      onClick={() => addNewClick2PayCard()}
                    >
                     {getString("continueToClickToPay")}
                    </div>
                    <div className="checkout-method-save-information__text">
                     {getString("saveInfoWithClickToPay")}
                      <button
                        className="checkout-method-click-to-pay-text__learn-more click-to-pay__btn click-to-pay__btn--inline"
                        type="button"
                        onClick={showLearnMoreButton}
                      >
                       {getString("learnMore")}
                      </button>
                      {showLearnMoreModal && (
                        <div
                          className="click-to-pay__iframe-container"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="dialogLearnMoreClick2Pay"
                        >
                          <div
                            className="click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                                                         click-to-pay__iframe-modal--error click-to-pay__iframe-modal--scrollable"
                          >
                            <div>
                              <button
                                ref={buttonRef}
                                className="checkout-overlay-simple__close checkout-overlay-simple__close--dark margin-top"
                                onClick={closeLearnMoreButton}
                              >
                                <span className="collapse-text">
                                  {getString("close")}
                                </span>
                                <span
                                  className="material-icons"
                                  aria-hidden="true"
                                >
                                  {getString("close")?.toLocaleLowerCase()}
                                </span>
                              </button>
                            </div>
                            <src-learn-more
                              id="dialogLearnMoreClick2Pay"
                              display-ok-button="false"
                            ></src-learn-more>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <src-card-list
                  card-selection-type="radioButton"
                  display-preferred-card="true"
                  card-brands={cardBrandsString}
                />
              </div>
            </div>
          </div>
        )}
        <div className="js-c2p-otp-container" style={{ display: "none" }}>
          <src-otp-input
            type="overlay"
            data-otp-value=""
            display-cancel-option="true"
            masked-identity-value=""
            network-id=""
            hide-loader="false"
            display-remember-me="true"
            auto-submit="true"
            error-reason=""
          ></src-otp-input>
        </div>
        <div
          className="js-c2p-otp-selection-container"
          style={{ display: "none" }}
        ></div>
        {errorMessage.length > 0 && (
          <div
            className="click-to-pay__iframe-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialogClickToPayAddCard"
          >
            <div
              className="click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                    click-to-pay__iframe-modal--error
                     click-to-pay__iframe-modal--scrollable"
            >
              <div>
                <button
                  className="checkout-overlay-simple__close checkout-overlay-simple__close--dark margin-top"
                  onClick={handleCloseErrorMessage}
                >
                  <span className="collapse-text">{getString("close")}</span>
                  <span className="material-icons" aria-hidden="true">
                    {getString("close")}
                  </span>
                </button>
              </div>
              <div className="error-msg error-msg--padding">{errorMessage}</div>
            </div>
          </div>
        )}
        <div
          className="js-c2p-payment-add-card-container click-to-pay__iframe-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialogClickToPayAddCard"
          style={{ display: "none" }}
        >
          <Formik
            initialValues={{
              cardInfo: {
                accountName: "",
                number: "",
                cvv: "",
                expMonth: undefined,
                expYear: undefined,
              },
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              saveNewCard(values);
            }}
          >
            {({
              touched,
              errors,
              handleChange,
              handleBlur,
              submitForm,
              values,
            }) => (
              <form
                id="dialogClickToPayAddCard"
                className="js-c2p-payment-add-card-form click-to-pay__iframe-modal click-to-pay__iframe-modal--padding click-to-pay__iframe-modal--flex
                         click-to-pay__iframe-modal--scrollable"
              >
                <div>
                  <button
                    className="checkout-overlay-simple__close checkout-overlay-simple__close--dark margin-top margin-right"
                    onClick={closeAddCardOverlay}
                  >
                    <span className="collapse-text">{getString("close")}</span>
                    <span className="material-icons" aria-hidden="true">
                      {getString("close")?.toLocaleLowerCase()}
                    </span>
                  </button>
                </div>
                <div>
                  <div className="click-to-pay__iframe-content--scrollable click-to-pay__iframe-content--padding">
                    <div className="click-to-pay__heading">
                      {getString("cardInformation")}
                    </div>
                    <div>
                      <src-card-list card-brands={cardBrandsString} />
                      <div className="checkout-method-click-to-pay-text margin-bottom">
                        {getString("saveInfoWithClickToPay")}
                      </div>
                    </div>
                    <CardInputs
                      handleChange={handleChange}
                      touched={touched}
                      errors={errors}
                      handleBlur={handleBlur}
                      values={values}
                      isEditingExistingCard={false}
                      isEditing={false}
                      isFromClick2Pay={true}
                    />
                  </div>
                  <div className="form-footer form-footer__dual-button">
                    <Button
                      label={getString("cancel") as string}
                      btnType="secondary"
                      onClick={closeAddCardOverlay}
                    />
                    <Button
                      label="Save"
                      btnType="primary"
                      onClick={submitForm}
                    />
                  </div>
                </div>
              </form>
            )}
          </Formik>
        </div>
        <div
          className="js-c2p-payment-iframe-container click-to-pay__iframe-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialogClickToPay"
          style={{ display: "none" }}
        >
          <div className="click-to-pay__iframe-modal">
            <iframe
              id="dialogClickToPay"
              name="c2pPaymentIframe"
              className="click-to-pay__iframe-content"
            ></iframe>
          </div>
        </div>
        <input className="js-c2p-payment-data" type="hidden" />
      </div>
    </div>
  );
};
