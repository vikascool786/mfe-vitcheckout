import {ChangeOrder} from "../interfaces/ChangeOrder";
import {Order} from "../interfaces/Order";

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

export const orderHasAutoshipItems = (order: Order | null): boolean => {
    if (!order) return false;

    return Object.values(order.stores)
        .flatMap(store => store.items)
        .some(item => item.autoshipFreq > 0 || item.autoShipId !== undefined);
};