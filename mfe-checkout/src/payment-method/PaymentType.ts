interface PaymentType {
    name: string;
    typeId: number;
    siteflagTypeId: number;
}

export const CLICK2PAY: PaymentType = {
    name: "Click2Pay",
    typeId: 60,
    siteflagTypeId: 604
}

export const SEZZLE: PaymentType = {
    name: "Sezzle",
    typeId: 56,
    siteflagTypeId: 568
}

export const PAYPAL: PaymentType = {
    name: "Paypal",
    typeId: 48,
    siteflagTypeId: 393
}

export const thirdPartyPaymentFlagList = [
    CLICK2PAY.siteflagTypeId,
    SEZZLE.siteflagTypeId,
    PAYPAL.siteflagTypeId,
]