import { IPaymentOption } from "../../store";

export const updatedPaymentOptionsWithSelectedType = (paymentOptions: IPaymentOption[], selectedPaymentTypeId: number): IPaymentOption[] => {
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
}