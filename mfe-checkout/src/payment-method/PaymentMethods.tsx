import React, { useEffect, useState } from "react";
import { useShopperEWalletAddresses } from "../api/service/ShopperEWallet";
import {
  addTempPaymentMethod,
  fetchShoppersPaymentMethods,
} from "../api/service/ShoppersPaymentMethods";
import { Add } from "../assets/icons/Add";
import CardOptions from "../assets/images/CardOptions.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import { Back } from "../assets/svgs/Back";
import { Button } from "../component/Button/Button";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Address } from "../interfaces/Address";
import { PaymentOptionClick2Pay } from "../payment-method-click2pay/PaymentMethodOptionClick2Pay";
import {
  IPaymentOptionProps,
  PaymentOption,
} from "../payment-method-option/PaymentMethodOption";
import { TextUpdates } from "../text-updates/TextUpdates";
import "./PaymentMethods.scss";
import { generateChangeStoreResponse } from "../utils/helpers/GenerateChangeStoreResponse";
import { updatePaymentMethod } from "../utils/OrderUtils";
import { changeOrder, commitOrder } from "../api/service/Order";
import Click2PayUtil from "../payment-method-click2pay/Click2PayUtil";
import Click2PayPlaceOrder from "../payment-method-click2pay/Click2PayPlaceOrder";
import { getTransactionData } from "../api/service/Click2PayTransaction";
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import {
  PAYPAL,
  SEZZLE,
  CLICK2PAY,
  thirdPartyPaymentFlagList,
} from "./PaymentType";
import { fetchSiteFlagData } from "../api/service/SiteFlags";
import axios from "axios";

const staticPaymentMethods: IPaymentOptionProps[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions,
    selected: false,
    index: 0,
    size: 0,
    typeId: 1,
    visible: true,
    onChange: () => {},
  },
  {
    name: PAYPAL.name,
    image: PayPal,
    selected: false,
    index: 1,
    size: 0,
    typeId: PAYPAL.typeId,
    siteFlagId: 393,
    visible: false,
    onChange: () => {},
  },
  {
    name: SEZZLE.name,
    image: Sezzle,
    selected: false,
    index: 2,
    size: 0,
    typeId: SEZZLE.typeId,
    siteFlagId: 568,
    visible: false,
    onChange: () => {},
  },
];

interface IPaymentMethod {
  shopperId: string;
  cartId: string;
  siteId: string;
  pcid: string;
}

export const PaymentMethod: React.FC<IPaymentMethod> = ({
  shopperId,
  cartId,
  siteId,
  pcid,
}) => {
  const [allPaymentOptions, setAllPaymentOptions] =
    useState<IPaymentOptionProps[]>(staticPaymentMethods);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addresses } = useShopperEWalletAddresses(shopperId || "");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState(staticPaymentMethods);
  const [showClick2Pay, setShowClick2Pay] = useState(false);

  const [order, setOrder] = useAtom(orderAtom);

  useEffect(() => {
    const paymentSiteFlagList = thirdPartyPaymentFlagList.join(",");
    const fetchSiteFlagInfo = async () => {
      try {
        const response = await fetchSiteFlagData(siteId, paymentSiteFlagList);
        const updatedMethods = paymentMethods.map((method) => {
          const matchingResponse = response.find(
            (item: any) => item.flagID === method.siteFlagId
          );
          const c2pSiteflag = response.find(
            (item: any) => item.flagID === CLICK2PAY.siteflagTypeId
          );
          setShowClick2Pay(c2pSiteflag ? c2pSiteflag.active : false);

          return {
            ...method,
            visible: matchingResponse ? matchingResponse.active : false,
          };
        });

        setPaymentMethods(updatedMethods);
      } catch (error) {
        console.error("Failed to fetch siteflag data:", error);
      }
    };

    fetchSiteFlagInfo();
  }, []);

  useEffect(() => {
    const fetchShoppersSavedPayments = async (shopperId: string) => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperId);

        const shopperPayments: IPaymentOptionProps[] = response
          .map((item: any, index: number) => {
            return {
              name: item.type,
              image: item.imageUrl,
              selected: item.preferred,
              index,
              size: 0,
              visible: true,
              onChange: () => {},
              isSavedCard: true,
              shopperSavedPayment: {
                id: item.id,
                expirationDate: item.expires as string | "",
                cardMask: item.mask as string | "",
                preferred: item.preferred as boolean,
                type: item.type as string | "",
                accountName: item.accountName as string | "",
                name: item.type,
                image: item.imageUrl,
                address: addresses
                  ? addresses[item.addressId]
                  : ({} as Address),
              },
            };
          })
          .sort(
            (a: { selected: boolean }, b: { selected: boolean }) =>
              (b.selected ? 1 : 0) - (a.selected ? 1 : 0)
          );
        updatePaymentOptions(shopperPayments);
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    const updatePaymentOptions = (shopperPayments: IPaymentOptionProps[]) => {
      const displayedOptions = [
        ...(shopperPayments && shopperPayments[0]
          ? [shopperPayments[0]]
          : [paymentMethods[0]]),
        ...(isExpanded && shopperPayments ? shopperPayments.slice(1) : []),
        paymentMethods?.[1] ?? [], // PayPal
        paymentMethods?.[2] ?? [], // Sezzle
      ];

      setAllPaymentOptions(displayedOptions as IPaymentOptionProps[]);
      updatePaymentOptions(shopperPayments);
    };

    fetchShoppersSavedPayments(shopperId);
  }, [isExpanded, addresses, shopperId]);

  useEffect(() => {
    const handleDeselectPaymentMethodsEvent = () => {
      handlePaymentMethodChange(-1);
    };
    document.addEventListener(
      "deselectPaymentMethods",
      handleDeselectPaymentMethodsEvent
    );
  }, []);

  const handlePlaceOrder = (paymentTypeId: number) => {
    switch (paymentTypeId) {
      case CLICK2PAY.typeId:
        handleClick2PayPlaceOrder();
        break;
      case SEZZLE.typeId:
        console.log("place order with Sezzle");
        break;
      case PAYPAL.typeId:
        let config = {
          method: "GET",
          maxBodyLength: Infinity,
          url: "https://dev.shop.com/ajaxaction/checkout/Paypal?isCreditFlow=false&isGuest=false&&ajax=1&onlytoken=1&_=1735790216112",
          headers: {
            // Host: "dev.shop.com",
            // Referer:
            //   "https://dev.shop.com/nbts/checkout/payment?creditFlow=false",
            Cookie:
              'AMID=4265199322; _tt_enable_cookie=1; _ga=GA1.1.36821456.1729000583; PORTAL_NAME=""; _dvp=0:m41bv29d:V0wjRURzPTXj2By5Tz7_PBPUdodNWiua; CATALOGCITY_NCID=WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz; CC_DISTID=""; CO_VIEW=; _ttp=aKD-k3aAuKhOf_9uohbTpr4I_m5.tt.1; LAST_CCSYN_SRC=FAMOS; DEV_SHOPMF_NS_ID=022; CATALOGCITY_SSNDEV222=3006645208; CC_SRCID=17; SHOPLOCAL_PROMO_SEEN=0; COUNTRY_MATCH=false; PROMO_ACQUISITION_ELIGIBLE=false; GLOBAL_REDIRECT=Y; SHOPMF_NS_ID=011; CATALOGCITY_SSNLIVE260=4307366054; cf_clearance=oemIl94nv6zO.vhf4HAjTVmfj2d8KkHCJtUZh5WoDxQ-1735704389-1.2.1.1-934ub0TG5iDfqy6dANf2jnweB359Kd7M_84B3iU27lvaXaoXXiU0ye8vAN8hOkfcYxU5J0la.KZWc2VIEexr4zakLcXiDmqB4JDGDRNimTDgVcrMN3dCNoHvzFr9ya.jXNxPISEOlpV7ANG.S70jcCTUSjibGhKEUrK1OgbP1Y5zRGh5v0A6__aWtsWD1iIaCL6t7kURR5_OaipZSJsHMzpMnp_AVqO0AgHfkBOJmYtIltZUzLtXuDFagsdTrS.4CXzIr4lhenrOlE5Gs7qFvzA9qifgFmDFfm7dc5Tfyj8zAIVsgwzKGtJePMY4rXV4u.CzNJVK1YHW7IyJw9mdcfj7qGTiHxFeFWBkBw2od1cuKflKIY087r8knY4z7Jh0_ffeUb0uxm1U50BRi_c62vhs1DAQKk4kbvBluuRvhT0hhs9Xa9ws_4qqpo9pud4mdsCbu.TuFYjScR0uiU0QJg; tkrCookie=s16770; ftr_ncd=6; LAST_CCSYN=222; _ga_HWXLMG1NZE=GS1.1.1735704390.4.1.1735704478.45.0.0; NCID=WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz; __cf_bm=V4uAvojFo2r9Kg7.cwAJNARxzI_Ao1HTzSb6IvuHxr0-1735790004-1.0.1.1-BHRe9uqg28xLd7u5BUV1yLh5KUZNnsfIMAlej6HQmZyyPfx3LvWYKccY3tS_zShA67FL_Tifj0osXRUM2JveIA; JSESSIONID=769ECCE08C06BCAD5E2DF09282794BF1; _dvs=0:m5esk3ov:ATTYs9kx56oFf3NuiSQCmLvCOnxwgNKO; SSRMC=ZGV2X3Rlc3RfbmV3MDUxMiU0MHlvcG1haWwuY29tOjE3MzY5OTk2Nzc4OTA6OTIzM2Q0YWJlMmRjODU1YjIyZDE1MTdjMzdlYzQ2NDg; AMOS_SID=dev%3DZNLHzWxx%252Eh~UjVwkmXXzZkkmzhjZhzpXXVzkjmXkVehxVXZzekwh%26_dev_ticks%3D1735790071701; CART_COUNT=4; fs_lua=1.1735790289556; utag_main=_sn:10$_se:11%3Bexp-session$_ss:0%3Bexp-session$_st:1735792505237%3Bexp-session$ses_id:1735790013524%3Bexp-session$_pn:11%3Bexp-session; _uetsid=c2ec0ef0c7f511efba231faf5c6cd889|h2mgsi|2|fs8|0|1827; _uetvid=42d80da08afd11ef98d981c11b0c4088|vb1egs|1735790706407|12|1|bat.bing.com/p/insights/c/z; fs_uid=#13M37F#5233045301047296:8798207394049705353:::#44bd1580#/1760536715; forterToken=8b2f7837b04745a3a85aae2f9b5ba1fe_1735790704686_1457_UDF43-m4_21ck_; _ga_M4XSTTYQVD=GS1.1.1735790015.10.1.1735790709.0.0.0; AMID=3006645209; CATALOGCITY_SSNDEV222=3006645209; CC_SRCID=17; DEV_SHOPMF_NS_ID=022; LAST_CCSYN=222; LAST_CCSYN_SRC=FAMOS; PROMO_ACQUISITION_ELIGIBLE=false; PROMO_ACQUISITION_SHOWN=false; SHOPLOCAL_PROMO_SEEN=0; COUNTRY_MATCH=false; JSESSIONID=07DDDC83514A1610FC50B646A978EBDA',
          },
        };

        axios
          .request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      default:
        console.log("place order with regular credit card");
        break;
    }
  };

  const getClickToPayTransactionData = async (
    flowId: string,
    transId: string,
    total: string
  ) => {
    try {
      const response = await getTransactionData(flowId, transId, total);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleClick2PayPlaceOrder = () => {
    console.log("place order with click 2 pay");
    const digitalCardId = Click2PayPlaceOrder.getDigitalCardId();
    const c2pPlaceOrderPromise = Click2PayPlaceOrder.handleCheckoutWithC2P(
      // @ts-ignore
      window.c2pInstance,
      digitalCardId
    );
    c2pPlaceOrderPromise
      .then((response: any) => {
        if (response.checkoutActionCode === "COMPLETE") {
          const transId = response.headers["merchant-transaction-id"];
          const flowId = response.headers["x-src-cx-flow-id"];
          const total = Click2PayUtil.getC2pData().transactionAmount;
          const promiseClick2PayTransData = getClickToPayTransactionData(
            flowId,
            transId,
            total
          );
          promiseClick2PayTransData.then((response: any) => {
            const paymentMethodResponse = response.data.paymentMethod;
            //use response to create a temp payment id
            const walletData = {
              name: paymentMethodResponse.accountName,
              number: paymentMethodResponse.number,
              token: paymentMethodResponse.token,
              month: paymentMethodResponse.expMonth,
              year: paymentMethodResponse.expYear,
              type: paymentMethodResponse.typeID,
            };
            const promiseTempPayment = addTempPaymentMethod(
              shopperId,
              walletData
            );
            promiseTempPayment.then((response: any) => {
              const paymentId = response.data.id;
              if (order) {
                let changeOrderPayload = generateChangeStoreResponse(order);
                changeOrderPayload = updatePaymentMethod(
                  changeOrderPayload,
                  paymentId
                );
                const changeOrderPromise = changeOrder(
                  changeOrderPayload,
                  cartId
                );
                changeOrderPromise.then((response: any) => {
                  //place the order
                  const promiseCommitOrder = commitOrder(cartId);
                  promiseCommitOrder.then((response: any) => {
                    const orderId = response.data.response.success.data.orderId;
                    window.location.href = `/nbts/orderconfirmation-${orderId}`;
                  });
                });
              }
            });
          });
        }
      })
      .catch((error: { message: string }) => {
        console.log("c2p place order failed: " + error.message);
      });
  };

  const handlePaymentMethodChange = (selectedIndex: number) => {
    const isPaypal = allPaymentOptions.find(
      (option, index) => index === selectedIndex
    )?.name;

    if (isPaypal === PAYPAL.name) {
      handlePlaceOrder(PAYPAL.typeId);
      return;
    }
    setAllPaymentOptions((prevOptions) =>
      prevOptions.map((option, index) => ({
        ...option,
        selected: index === selectedIndex,
      }))
    );
    // Collapse any editing card when a new payment method is selected
    if (editingOptionIndex !== null && editingOptionIndex !== selectedIndex) {
      setEditingOptionIndex(null);
    }
  };

  // Toggle function for expanding or collapsing the card list
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const onAddNewCard = async () => {
    const newCardIndex = allPaymentOptions.length;

    // Add a temporary entry for the new card in edit mode
    const newCard: IPaymentOptionProps = {
      name: "New Card",
      image: CardOptions, // Replace with a placeholder image or icon for new cards
      selected: false,
      index: newCardIndex,
      size: 0,
      onChange: () => {},
      isSavedCard: false,
      typeId: 9,
      visible: true,
      shopperId: "",
      shopperSavedPayment: {
        id: 0, // Generate an ID if necessary
        expirationDate: "",
        cardMask: "",
        preferred: false,
        type: 9,
        accountName: "",
        image: CardOptions,
        address: {} as Address,
      },
    };

    setAllPaymentOptions((prevOptions) => [...prevOptions, newCard]);
    setEditingOptionIndex(newCardIndex);
  };

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <div className="pm-title-container">
          <FormHeading title="Payment Method" />
          <div className="pm-show-card" onClick={toggleAccordion}>
            <div>{isExpanded ? "Hide other cards" : "See other cards"}</div>
            <Back className={`accordion ${isExpanded ? "open" : "close"}`} />
          </div>
        </div>
        <div className="pm-sub-container">
          {allPaymentOptions
            .filter((method) => method.visible)
            .map((paymentOption, index) => (
              <PaymentOption
                key={
                  paymentOption.shopperSavedPayment?.id || paymentOption.name
                }
                {...{ ...paymentOption, index }}
                isEditing={editingOptionIndex === index}
                onEdit={() => setEditingOptionIndex(index)}
                onCancelEdit={() => setEditingOptionIndex(null)}
                onChange={() => handlePaymentMethodChange(index)}
                shopperId={shopperId}
              />
            ))}
          {showClick2Pay && <PaymentOptionClick2Pay pcid={pcid} />}
          <div className="checkout-add-card" onClick={onAddNewCard}>
            <div className="checkout-add-card-text">
              <Add /> Add New Card
            </div>
            <div>
              <img src={CardOptions} />
            </div>
          </div>
        </div>
      </div>
      <TextUpdates />
    </div>
  );
};
