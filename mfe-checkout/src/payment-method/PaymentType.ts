interface PaymentType {
    name: string;
    typeId: number;
    siteflagTypeId?: number;
    altName?: string;
}

const VISA: PaymentType = {
    name: "Visa",
    typeId: 9,
    altName: "visa"
}

const MASTERCARD: PaymentType = {
    name: "Mastercard",
    typeId: 6,
    altName: "mastercard"
}

const AMEX: PaymentType = {
    name: "American Express",
    typeId: 1,
    altName: "amex"
}

const DISCOVER: PaymentType = {
    name: "Discover",
    typeId: 5,
    altName: "discover"
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

const thirdPartyPayments = [
    CLICK2PAY,
    SEZZLE,
    PAYPAL,
]

export const thirdPartyPaymentFlagList = (): number[] => {
    return thirdPartyPayments.map(payment => payment.siteflagTypeId ?? 0);
}
export const thirdPartyPaymentTypeIdList  = (): number[] => {
    return thirdPartyPayments.map(payment => payment.typeId);
}

export const creditCards = [
    VISA, MASTERCARD, AMEX, DISCOVER,
]