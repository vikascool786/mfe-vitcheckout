import { generateCardToken, addShoppersPaymentMethod, addTempPaymentMethod, updateTempPaymentMethod } from "../../api/service/ShoppersPaymentMethods";
import { getCardType } from "./GetCardType";
import { getTypeIdByAltName } from "../../payment-method/PaymentType";
import { generateChangeStoreResponse } from "./GenerateChangeStoreResponse";
import { buildOrder } from "../../api/service/Order";
import { CreditCardFormData } from "../../component/Form/CreditCardFormContext";
import { Order } from "../../interfaces/Order";

export const handleSaveCard = async (
    creditCardFormData: CreditCardFormData,
    shopperId: string,
    dependencies: {
        order: Order | undefined;
    },
    getString:(key: string, replacements?: string[]) => string | undefined
) => {
    const {
        order,
    } = dependencies;
    const typeId = getTypeIdByAltName(getCardType(creditCardFormData.cardInfo.number).toLowerCase()) || 9;
    const acceptablePaymentMethods = order?.paymentMethods
        .filter((pm: { typeID: number | undefined; }) => pm.typeID === typeId)
        .map((pm: { typeID: any; }) => pm.typeID);

    if (acceptablePaymentMethods?.length === 0 || !acceptablePaymentMethods?.includes(typeId)) {
        return {error: getString("cardTypeNotAccepted") as string};
    }

    try {
        const cardTokenResponse = await generateCardToken(creditCardFormData.cardInfo.number);
        const token = cardTokenResponse?.token.id;
        const number = cardTokenResponse?.token.mask;

        let payload: any = {
            name: creditCardFormData.cardInfo.accountName,
            number: number,
            token: token,
            month: creditCardFormData.cardInfo.expMonth,
            year: creditCardFormData.cardInfo.expYear,
            preferred: creditCardFormData.saveForLater,
            cvv: creditCardFormData.cardInfo.cvv,
            type: typeId,
            ...(creditCardFormData.addressId !== undefined && { addressId: creditCardFormData.addressId }),
        };

        if(creditCardFormData.addressId){
            payload.addressId = creditCardFormData.addressId;
        } else{
            payload.first = creditCardFormData.first;
            payload.last = creditCardFormData.last;
            payload.address1 = creditCardFormData.address1;
            payload.address2 = creditCardFormData.address2;
            payload.city = creditCardFormData.city;
            payload.state = creditCardFormData.state;
            payload.zip = creditCardFormData.zip;
            payload.phone = creditCardFormData.phone?.replace(/\D/g, "");
        }

        let newPaymentInfo;

        if(creditCardFormData.saveForLater){ //save to shopper wallet
            const response = await addShoppersPaymentMethod(shopperId, {
                ...payload
            })
            newPaymentInfo = response.at(-1); // wallet response returns all shopper payments, last one in list will be the newest

        } else{ //save as temp payment
            const response = await addTempPaymentMethod(shopperId, {
                ...payload
            })
            newPaymentInfo = response;
        }

        //update order with new payment id
        if(order && newPaymentInfo){
            const updatedOrder = generateChangeStoreResponse({
                ...order,
                billingAddress: {
                    ...order.billingAddress,
                    id: newPaymentInfo?.addressId as number,
                },
                paymentMethod: {
                    ...order.paymentMethod,
                    id: newPaymentInfo?.id as number,
                },
            });

            const orderResponse = await buildOrder(updatedOrder);
            if(orderResponse){
                return { updatedOrder: {...orderResponse.response.success.data,
                        isOrderValid: true}
                };
            }
        }

    } catch (error: any) {
        if (error?.response?.data) {
            return {error: error?.response?.data};
        }
        return {error: "There was an issue saving your credit card information"}
    } finally {
        const section = document.getElementById("pm-main");
        section?.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
        });
    }
};