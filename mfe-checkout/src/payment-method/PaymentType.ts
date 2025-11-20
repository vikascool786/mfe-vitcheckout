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
    typeId: 31,
    siteflagTypeId: 393
}

export const PAYPAL_RECURRING: PaymentType = {
    name: "Paypal", //display as Paypal in UI to user
    typeId: 58,
    siteflagTypeId: 580
}

export const APPLEPAY: PaymentType = {
    name: "ApplePay",
    typeId: 50,
    siteflagTypeId: 587
}

const thirdPartyPayments = [
    CLICK2PAY,
    SEZZLE,
    PAYPAL,
    PAYPAL_RECURRING,
    APPLEPAY
]

const paypalPayments = [
    PAYPAL,
    PAYPAL_RECURRING,
]

export const thirdPartyPaymentFlagList = (): number[] => {
    return thirdPartyPayments.map(payment => payment.siteflagTypeId ?? 0);
}
export const thirdPartyPaymentTypeIdList  = (): number[] => {
    return thirdPartyPayments.map(payment => payment.typeId);
}

export const isThirdPartyPayment  = (paymentTypeId: number): boolean => {
    return thirdPartyPaymentTypeIdList().includes(paymentTypeId);
}

export const isPaypalPayment  = (paymentTypeId: number): boolean => {
    return paypalPayments.some(payment => payment.typeId === paymentTypeId);
}

export const creditCards = [
    VISA, MASTERCARD, AMEX, DISCOVER,
]

export const getTypeIdByAltName = (altName: string): number | undefined => {
    return creditCards.find(payment => payment.altName === altName)?.typeId;
}

export const creditCardTypeIds = creditCards.map(card => card.typeId);