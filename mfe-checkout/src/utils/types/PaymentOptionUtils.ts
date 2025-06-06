import { IPaymentOption } from "../../store";
import { IPaymentMethod2 } from "../../interfaces/Order";
import { createPaymentMethod } from "../helpers/GeneratePaymentMethod";
import CardOptions from "../..//assets/images/CardOptions.png";
import { Address } from "../../interfaces/Address";

export const createNewCardOption = (): IPaymentOption => {
  const newCard = createPaymentMethod({
    accountName: "",
    imageUrl: CardOptions,
    id: 0,
    typeID: 9,
    addressId: 0,
    expMonth: undefined,
  });

  return {
    paymentMethod: newCard,
    paymentAddress: {} as Address,
    isPaymentValidated: false,
    isSelected: true,
    isVisible: true,
    isEditing: true,
  };
};

export const isNewCardInPaymentOptions = (
  paymentOptions: IPaymentOption[]
): boolean => {
  return paymentOptions.some(
    (method) =>
      method.paymentMethod.typeID === 9 && method.paymentMethod.id === 0
  );
};

export const updatedPaymentOptionsWithSelectedType = (
  paymentOptions: IPaymentOption[],
  selectedPaymentTypeId: number
): IPaymentOption[] => {
  return paymentOptions.map((paymentOption) => {
    if (paymentOption.paymentMethod.typeID === selectedPaymentTypeId) {
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
};

export const getSelectedPaymentOption = (
  paymentOptions: IPaymentOption[]
): IPaymentOption | undefined => {
  return paymentOptions.find((option) => option.isSelected);
};

export const returnPaymentOptionsWithDefaultSelection = (
  paymentOptions: IPaymentOption[]
): IPaymentOption[] => {
  const preferredPaymentMethod = paymentOptions.find(
    (option) => option.paymentMethod.preferred
  );

  const paymentIdToSelect = preferredPaymentMethod
    ? preferredPaymentMethod.paymentMethod.id
    : 0;

  return paymentOptions.map((option) => ({
    ...option,
    isVisible: true,
    isSelected: option.paymentMethod.id === paymentIdToSelect,
  }));
};

export const isSelectedPaymentInAllowedOrderPayments = (
  paymentOptions: IPaymentOption[],
  allowedPaymentOptions: IPaymentMethod2[]
): boolean => {
  const selectedPayment = getSelectedPaymentOption(paymentOptions);

  if (selectedPayment) {
    return allowedPaymentOptions.some(
      (option) => option.typeID === selectedPayment.paymentMethod.typeID
    );
  }
  return false;
};
