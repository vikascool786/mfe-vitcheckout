import React, { useEffect, useState } from "react";
import { Portal } from "../interfaces/Portal";
import { OrderStore } from "../interfaces/Order";
import { doShippingCalc } from "../api/service/ShippingCalc";
import { FreeShipData } from "../interfaces/FreeShipData";
import { formattedNumber } from "../utils/OrderUtils";
import {isGiftCardStore} from "../utils/StoreUtils";

interface IShippingMessageProps {
  orderStore: OrderStore;
  portalData: Portal;
}

export const FreeShipMessage: React.FC<IShippingMessageProps> = ({
  orderStore,
  portalData,
}) => {
    const [freeShippingData, setFreeShippingData] = useState({
        hasFreeShipping: false,
        shipFreeMessage: "",
        isFreeShipMet: false,
        freeShipDifference: "",
    isMA: Boolean(orderStore.store?.isMA),
    storeName: orderStore.store?.catalogName,
    });
    const [freeShipMessage, setFreeShipMessage] = useState(freeShippingData.shipFreeMessage);
    const [freeShipPolicy, setFreeShipPolicy] = useState("policy");
    const [showFreeShipPolicy, setShowFreeShipPolicy] = useState(false);
    const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);

    useEffect(() => {
    //free ship portal settings only apply to MA products
    let isMAFreeShip =
      portalData.hasFreeShipping && Boolean(orderStore.store?.isMA);
      const freeShipData: FreeShipData = {
          hasFreeShipping: isMAFreeShip,
          shipFreeMessage: "",
          isFreeShipMet: false,
          freeShipDifference: "",
      isMA: Boolean(orderStore.store?.isMA),
      storeName: orderStore.store?.catalogName,
    };
    if (isMAFreeShip || !orderStore.store?.isMA) {
      const catalogId = String(orderStore.store?.catalogId);
        doShippingCalc(portalData.portalId, orderStore.items)
        .then((response) => {
          if (!orderStore.store?.isMA) {
            freeShipData.hasFreeShipping =
              response.quotes[catalogId]?.[0]?.hasFreeShipping ?? false;
            setFreeShipPolicy(
              buildFreeShipPolicy(response.quotes[catalogId]?.[0]?.storeMessage)
            );
                }
                if(freeShipData.hasFreeShipping){
                    const currency = response.quotes[catalogId]?.[0]?.currency;
            let freeShipDiff = freeShipData?.isMA
              ? response.quotes[catalogId]?.[0]?.freeShipDiff
              : response.quotes[catalogId]?.[0]?.freeShippingThreshold
                  ?.freeShipDiff;
            freeShipData.freeShipDifference = `${currency}${formattedNumber(
              freeShipDiff
            )}`;
            freeShipData.isFreeShipMet = freeShipData?.isMA
              ? response.quotes[catalogId]?.[0]?.freeShipMet ||
                freeShipDiff <= 0
              : freeShipDiff <= 0;

                    setFreeShippingData(freeShipData);
                    setFreeShipMessage(buildFreeShipMessage(freeShipData));
                }
            })
        .catch((error) => {
                console.error("Error with shipping calc", error);
        });
    }

    }, [orderStore]);

    const buildFreeShipMessage = (freeShipData: FreeShipData): string => {
        let freeShipMessage = "";
        if(freeShipData.hasFreeShipping){
            if(freeShipData.isFreeShipMet){
                freeShipMessage = "Congratulations! Your order qualifies for free shipping.";
            } else{
                freeShipMessage = `Add ${freeShipData.freeShipDifference} in ${freeShipData.storeName} products for free shipping.`
            }
        }
        return freeShipMessage;
    };

    const buildFreeShipPolicy = (storeMessage: any): string => {
        let freeShipPolicyMessage = "";
        if(storeMessage){
            freeShipPolicyMessage = `<div class="free-ship-policy__heading">${storeMessage?.description}</div><div class="free-ship-policy__text">${storeMessage?.displayText}</div>`
        }
        return freeShipPolicyMessage;
    };

    useEffect(() => {
    const iframe = document.querySelector(
      ".free-ship-policy-iframe"
    ) as HTMLIFrameElement;
        if (iframe) {
            iframe.onload = function () {
        if (iframe && iframe.contentWindow) {
          const iframeDocument =
            iframe.contentDocument || iframe.contentWindow.document;
          const sectionToKeep =
            iframeDocument.querySelector(".js-main-content");

                    if (sectionToKeep) {
                        iframeDocument.body.innerHTML = sectionToKeep.innerHTML;
                        iframe.style.display = "block";
                        setIsLoadingPolicy(false);
                    }
                }
            };
        }

    }, [showFreeShipPolicy]);

    const showShippingPolicy = () => {
    setIsLoadingPolicy(freeShippingData?.isMA);
        setShowFreeShipPolicy(true);
    }

    const closeShippingPolicy = () => {
        setShowFreeShipPolicy(false);
    }

  return (
    <div className="free-ship-container">
      { freeShipMessage.length > 0 && (
          <div className="alert-message">{freeShipMessage}
              { freeShipPolicy.length > 0 && !freeShippingData.isFreeShipMet && (
                  <button className="free-ship-policy-btn" type="button"
                          onClick={showShippingPolicy}>
                      view free shipping policy
                  </button>
              )}
          </div>
      )}
        { showFreeShipPolicy && (
            <div className="overlay-wrapper">
                <div className="overlay-simple max-500">
                    <button
                        className="overlay-simple__close overlay-simple__close--dark margin-top"
              onClick={closeShippingPolicy}
            >
                        <span className="collapse-text">Close</span>
              <span className="material-icons" aria-hidden="true">
                close
              </span>
                    </button>
            {freeShippingData?.isMA ? (
                            <div>
                                { isLoadingPolicy && (
                                    <p>Loading Market America free shipping policy...</p>
                                )}
                                <iframe className="free-ship-policy-iframe" src="/about-shipfree.html" width="100%"
                                        height="500px" style={{display: 'none'}}></iframe>
                            </div>
                        ) :
                        (
                            <div dangerouslySetInnerHTML={{__html: freeShipPolicy}}/>
                        )}

                </div>
            </div>
        )}

    </div>
  );
};
