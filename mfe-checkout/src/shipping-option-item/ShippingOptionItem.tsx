import React from "react";
import { RadioButton } from "../component/RadioButton/RadioButton";
import { ShippingSelection } from "../interfaces/ShippingMethod";
import "./ShippingOptionItem.scss";
import { AutoshipIcon } from "../assets/icons/Autoship";
import { useContentStrings } from "../hooks/useContentStrings";

interface IShippingOption {
  shippingType: string;
  arrivesIn: string;
  price: string;
  isSelected?: boolean;
}

interface IShippingOptionItem {
  shippingOption: ShippingSelection;
  index: number;
  size: number;
  isSelected: boolean;
  onChange?: () => void;
  hasAutoship: boolean;
  qaTag?: string;
  isExpanded?: boolean;
}

export const ShippingOptionItem: React.FC<IShippingOptionItem> = ({
  shippingOption,
  isSelected,
  onChange,
  index,
  size,
  hasAutoship,
  qaTag = "",
  isExpanded = false,
}) => {
  const select = isSelected ? "selected" : "";
  const isFirst = index === 0 ? "start" : "";
  const isLast = index === size ? "end" : "";
  const { getString } = useContentStrings();
  return (
    <div
      className={`qa-selection shipping-option-container ${select} ${isFirst} ${isLast}`}
      id={shippingOption.id.toString()}
      onClick={
        !shippingOption.isSelected && onChange ? () => onChange() : undefined
      }
    >
      <div className="shipping-option-wrapper">
        <div className="shipping-option-select-container">
          {size === 0 ? null : (
            <RadioButton
              id={shippingOption.id.toString()}
              checked={shippingOption.isSelected}
            />
          )}
          <div className={`shipping-option-sub-container`}>
            <div>{shippingOption.displayMethod}</div>
            <div className="shipping-option-estShipDate">
             {shippingOption.estShipDisplayDate && `${getString("estimatedDeliveryDate")}: ${shippingOption.estShipDisplayDate}`}
            </div>
          </div>
        </div>

        <div>
          {shippingOption?.shipDisc >0 ? (
            <div className="shipping-option-shipDisc-wrapper">
              <span className="shipping-option-shipDisc-span">
                {shippingOption?.shipDiscStr}
              </span>
              <span className="shipping-option-shipDisc-strikeout">
                {shippingOption?.totalStr}
              </span>
            </div>
          ) : (
            <div>
              {shippingOption?.totalStr}
            </div>
          )}
        </div>
      </div>
      {hasAutoship && shippingOption.isSelected && (
        <div
          className={`shipping-option-autoship ${
            isExpanded ? "" : "shipping-option-autoship-no-padding"
          }`}
        >
          <AutoshipIcon />
          {getString("recurringSubscribeAndSaveShipping")}
        </div>
      )}

      {shippingOption.isSelected &&
        shippingOption.method === "@ Market America's Office" && (
          <div className="shipping-option-office">
            <h4 className="shipping-option-office-title">
              {getString("pickupInstructions-title")}
            </h4>
            <ul className="shipping-option-office-address">
              <li>{getString("pickupNextBusinessDay")}</li>
              <li>{getString("pickupNotificationEmailSms")}</li>
              <li>{getString("contactlessPickupHours")}</li>
              <li>{getString("contractFreePickupCallWhenArrive")}</li>
              <li>{getString("pickupLocationFrontRightDoor")}</li>
              <li>{getString("staffWillBringOrderOutside")}</li>
              <li>{getString("signInvoiceLeaveOnTable")}</li>
              <li>{getString("callForOrderAssistance")}</li>
            </ul>
          </div>
        )}
    </div>
  );
};
