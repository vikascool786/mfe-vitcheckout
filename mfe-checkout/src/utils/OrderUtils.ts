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