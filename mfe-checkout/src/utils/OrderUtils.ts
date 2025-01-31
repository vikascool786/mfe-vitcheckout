import {ChangeOrder} from "../interfaces/ChangeOrder";

export function updatePaymentMethod(order: ChangeOrder, newPaymentMethodId: number): ChangeOrder {
    return {
        ...order,
        paymentMethod: {
            ...order.paymentMethod,
            id: newPaymentMethodId,
        },
    };
}

export const formattedNumber = (num: any) => Number(num).toFixed(2);