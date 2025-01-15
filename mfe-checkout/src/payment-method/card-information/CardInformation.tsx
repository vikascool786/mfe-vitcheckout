import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { buildOrder } from "../../api/service/Order";
import {
  addShoppersPaymentMethod,
  addTempPaymentMethod,
  updateShopperDetails,
} from "../../api/service/ShoppersPaymentMethods";
import { AddressForm } from "../../component/AddressForm";
import { Button } from "../../component/Button/Button";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import { Address } from "../../interfaces/Address";
import { IPaymentMethod } from "../../interfaces/PaymentMethod";
import {
  addressAtom,
  IPaymentOption,
  orderAtom,
  paymentMethodsAtom,
} from "../../store";
import { generateChangeStoreResponse } from "../../utils/helpers/GenerateChangeStoreResponse";
import "./CardInformation.scss";
import { Form, Formik } from "formik";

interface ICardInformationProps {
  paymentMethod: IPaymentMethod;
  address: Address;
  shopperId: string;
  onCancel: () => void;
}

export const CardInformation: React.FC<ICardInformationProps> = ({
  paymentMethod,
  shopperId,
  address,
  onCancel,
}) => {
  const [isCardSavedInWallet, setIsCardSavedInWallet] = useState(
    paymentMethod.id !== 0
  );

  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const addressList = useAtomValue(addressAtom);
  const [order, setOrder] = useAtom(orderAtom);

  const shippingAddress = addressList.find((add) => add.isPrimary);
  const [sameShippingAddress, setSameShippingAddress] =
    useState<boolean>(false);

  const [cardAddress, setcardAddress] = useState<Address>(address);

  const initialValues: IPaymentMethod = {
    ...paymentMethod,
    cvv: "",
  };

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    accountName: Yup.string().required("Name on Card is required"),
    number: Yup.string()
      .matches(
        /^(?:[0-9]{16}|[0-9]{6}\*{6}[0-9]{4})$/,
        "Card Number must be 16 digits"
      )
      .required("Card Number is required"),
    expMonth: Yup.number()
      .min(1, "Invalid month")
      .max(12, "Invalid month")
      .required("Expiration Month is required"),
    expYear: Yup.number()
      .min(new Date().getFullYear(), "Invalid year")
      .required("Expiration Year is required"),
    cvv: Yup.string()
      .matches(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits")
      .required("CVV is required"),
  });

  const handleSavecardAddress = async (
    values: IPaymentMethod,
    type: "TEMP" | "WALLET"
  ) => {
    const address = cardAddress;
    const requestData = {
      name: values.accountName,
      number: values.number,
      month: values.expMonth,
      year: values.expYear,
      preferred: values.preferred,
      first: address.first,
      last: address.last,
      type: 9,
      address1: address.address1,
      address2: address.address2,
      city: address.city || "New York",
      state: address.state,
      zip: address.zip,
      country: address.country || "USA",
      phone: address.phone,
      isPoBox: address.isPoBox || false,
      cvv: values.cvv,
    };

    console.log("here", values, type);
    try {
      if (type === "WALLET") {
        if (values.id !== 0) {
          await updateShopperDetails(shopperId, values.id, requestData);
          if (order && values.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: values.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder(orderResponse.response.success.data);
          }
          onCancel();
          return;
        }

        const response = await addShoppersPaymentMethod(shopperId, requestData);

        const updatedPaymentMethods = [
          ...paymentMethods,
          {
            paymentMethod: {
              ...response.at(-1),
              cvv: requestData.cvv,
            },
            paymentAddress: sameShippingAddress
              ? shippingAddress
              : ({} as Address),
            isSelected: true,
            isVisible: true,
          },
        ].filter((pm) => pm.paymentMethod?.id !== 0);

        setTimeout(
          () => setPaymentMethods(updatedPaymentMethods as IPaymentOption[]),
          300
        );

        onCancel();

        if (order && paymentMethod) {
          const updatedOrder = generateChangeStoreResponse({
            ...order,
            paymentMethod: {
              ...order.paymentMethod,
              id: response.at(-1)?.id as number,
            },
          });
          const orderResponse = await buildOrder(updatedOrder);
          setOrder(orderResponse.response.success.data);
        }
      } else if (type === "TEMP") {
        onCancel();
        const response = await addTempPaymentMethod(shopperId, requestData);

        if (response) {
          const updatedPaymentMethod = {
            ...response,
          };

          const updatedPaymentMethods = [
            ...paymentMethods,
            {
              paymentMethod: {
                ...updatedPaymentMethod,
                cvv: requestData.cvv,
              },
              paymentAddress: {} as Address,
              isSelected: true,
              isVisible: true,
            },
          ].filter((pm) => pm.paymentMethod.id !== 0);

          if (order && response.id) {
            const updatedOrder = generateChangeStoreResponse({
              ...order,
              paymentMethod: {
                ...order.paymentMethod,
                id: response.id,
              },
            });
            const orderResponse = await buildOrder(updatedOrder);
            setOrder(orderResponse.response.success.data);
          }

          setTimeout(() => setPaymentMethods(updatedPaymentMethods));
        }
      }
    } catch (error) {
      console.error("Error saving card information:", error);
    }
  };

  const handleCancelNewCard = (values: IPaymentMethod) => {
    const isCancelWhileAddingNewCard = values.id === 0;

    if (!isCancelWhileAddingNewCard) return;

    setTimeout(() => {
      setPaymentMethods(
        paymentMethods
          .filter((paymentMethod) => paymentMethod.paymentMethod.id !== 0)
          .map((paymentOption) =>
            paymentOption.paymentMethod.preferred
              ? {
                  ...paymentOption,
                  isSelected: true,
                }
              : paymentOption
          )
      );
    }, 100);
  };

  const getYears = (startYear: number, endYear: number) =>
    Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: `${startYear + i}`,
      label: `${startYear + i}`,
    }));

  const currentYear = new Date().getFullYear();
  const years = getYears(currentYear, currentYear + 10);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log("Here on submit");
        handleSavecardAddress(values, isCardSavedInWallet ? "WALLET" : "TEMP");
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="card-information-container">
            <FormField
              label="Name on Card"
              required
              name="accountName"
              value={values.accountName}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.accountName && errors.accountName}
            />
            <FormField
              label="Card Number"
              required
              name="number"
              value={values.number}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.number && errors.number}
            />
            <div className="form-field-container">
              <DropdownField
                label="Expiration Month"
                selectedValue={values.expMonth?.toString()}
                options={[...Array(12)].map((_, i) => ({
                  value: (i + 1).toString().padStart(2, "0"),
                  label: (i + 1).toString().padStart(2, "0"),
                }))}
                onChange={(value) => handleChange("expMonth")(value)}
                errorMessage={touched.expMonth && errors.expMonth}
              />
              <DropdownField
                label="Expiration Year"
                selectedValue={values.expYear?.toString()}
                options={years}
                onChange={(value) => handleChange("expYear")(value)}
                errorMessage={touched.expYear && errors.expYear}
              />
            </div>
            <FormField
              label="CVV"
              required
              name="cvv"
              type="password"
              value={values.cvv}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.cvv && errors.cvv}
            />
            <div className="save-for-later">
              <input
                type="checkbox"
                className="checkbox"
                checked={isCardSavedInWallet}
                onChange={(e) => setIsCardSavedInWallet(!isCardSavedInWallet)}
              />
              <span>Save card for later</span>
            </div>
            <div className="billing">
              <input
                type="checkbox"
                className="checkbox"
                checked={sameShippingAddress}
                onChange={() => setSameShippingAddress(!sameShippingAddress)}
              />
              <span>Same as shipping</span>
            </div>

            {!sameShippingAddress ? (
              <AddressForm
                shippingAddress={cardAddress}
                siteId="260"
                onAddressChange={(updatedAddress) => {
                  setcardAddress((prevState) => ({
                    ...prevState,
                    address: updatedAddress,
                  }));
                }}
              />
            ) : (
              <div className="checkbox-text">
                {shippingAddress?.first} {shippingAddress?.last}{" "}
                {shippingAddress?.address1}
                {shippingAddress?.address2} {shippingAddress?.city}{" "}
                {shippingAddress?.zip}
              </div>
            )}
            <div className="button-container">
              <Button
                btnType="secondary"
                label="Cancel"
                onClick={() => {
                  onCancel();
                  handleCancelNewCard(values);
                }}
              />
              <Button
                btnType="primary"
                label={isCardSavedInWallet ? "Update" : "Save"}
                onClick={() => handleSubmit()}
              />
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};
