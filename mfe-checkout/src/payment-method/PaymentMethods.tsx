import React, {useEffect, useState} from "react";
import "./PaymentMethods.scss";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { Button } from "../component/Button/Button";
import CardOptions from "../assets/images/CardOptions.png";
import PayPal from "../assets/images/PayPal.png";
import Sezzle from "../assets/images/Sezzle.png";
import ClickToPay from "../assets/images/ClickToPay.png";
import { PaymentMethodOption } from "../payment-method-option/PaymentMethodOption";
import {fetchShoppersPaymentMethods} from "../api/service/ShoppersPaymentMethods";
import {ShopperSavedPayments} from "../interfaces/ShopperSavedPayments";
import {SavedCreditCard} from "../payment-method-option/SavedCreditCard";
import { TextUpdates } from "../text-updates/TextUpdates";

export interface IPaymentMethodOption {
  name: string;
  image: string;
  selected: boolean;
  show: boolean;
  shopperSavedPayment?: ShopperSavedPayments;
}

const paymentMethods: IPaymentMethodOption[] = [
  {
    name: "Credit or Debit Card",
    image: CardOptions, // Replace with actual image path
    selected: true, // Change to true if you want to set it as selected
    show: true,
  },
  {
    name: "PayPal",
    image: PayPal, // Replace with actual image path
    selected: false, // Change to true if you want to set it as selected
    show: true,
  },
  {
    name: "Sezzle",
    image: Sezzle, // Replace with actual image path
    selected: false, // Change to true if you want to set it as selected
    show: true,
  },
];

export const PaymentMethod: React.FC = () => {
  const [shopperPayments, setShopperPayments] = useState<IPaymentMethodOption[]>([]);
  const [showAddCardForm, setShowAddCardForm] = useState<boolean>(false);

  useEffect(() => {
    const shopperID =
        "mZjhWVwjzVzpVzhYxWzpeWXzUzUxepzXYXVWzkjh"; //shopper with empty wallet
        //"WxxeWXwhzWUhmzhYXVzYzzezkexjewwqhpXkzehwpz"; // shopper with multiple types of cards
        //"hqwxZzYzzqpeVzhWmZzZmZpzzkxkjzmZWqqWzxzkzj"; /*todo - need to update with dynamic shopperId*/
    const fetchShoppersSavedPayments = async () => {
      try {
        const response = await fetchShoppersPaymentMethods(shopperID);
        const shopperPayments: IPaymentMethodOption[] =
            response.length ?
                response.map((item: any) => ({
          name: item.type,
          image: item.imageUrl,
          selected: item.preferred,
          show: true,
          shopperSavedPayment: {
            id: item.id as string | "",
            expirationDate: item.expires as string | "",
            cardMask: item.mask as string | "",
            preferred: item.preferred as boolean,
            type: item.type as string | ""
          }
        }))
        : [];
        setShopperPayments(shopperPayments);
        const showAddCardForm = shopperPayments.length < 1;
        setShowAddCardForm(showAddCardForm);
        if(!showAddCardForm){
          if (paymentMethods[0] !== undefined) {
            paymentMethods[0].show = false;
          }
        }
      } catch (error) {
        console.error("Failed to fetch shopper payment data:", error);
      }
    };

    fetchShoppersSavedPayments();
  }, []);

  return (
    <div className="pm-main-container">
      <div className="pm-container">
        <FormHeading title="Payment Method" />
        <div className="pm-sub-container">
          {shopperPayments.map((shopperPayment, index) => (
            <SavedCreditCard paymentMethod={shopperPayment} index={index}/>
          ))}
          {paymentMethods.map((paymentMethod, index) => (
            <PaymentMethodOption
              key={index}
              paymentMethod={paymentMethod}
              index={index}
              onChange={() => {}}
              size={paymentMethods.length}
              showAddCardForm={showAddCardForm}
            />
          ))}
          <div className="checkout-method-click-to-pay">
            <div className="checkout-method-save-information">
              <div className={`checkout-method-click-to-pay-text`}>
                Save my information with Click to Pay
              </div>
              <div className="checkout-method-click-to-pay-text">
                for fast, secure checkout.{" "}
                <span className="learn-more">Learn more</span>
              </div>

              <div>+ Continue to Click to Pay</div>
              <img src={ClickToPay} />
            </div>
          </div>
        </div>
      </div>
      <TextUpdates />
      <div className="checkout-place-order">
        <div className="checkout-place-order-text">
          By clicking place order, you agree to the SHOP.COM Terms of Use and
          Privacy Policy.
        </div>
        <Button label="Place Order" type="primary" />
      </div>
    </div>
  );
};
