import {ChangeOrder} from "../../interfaces/ChangeOrder";

export const generateStandardOrderPayload = (cartId: string, countryCode: string, languageCode: string): ChangeOrder => {
    return {
        id: cartId,
        customer_id: "",
        ufo_id: "",
        shipping_country: countryCode || "USA",
        product_country: countryCode || "USA",
        language: languageCode || "ENG",
        site_type: "W",
        application: "cart",
        userOptions: {
            applyEWallet: false,
            isOfAge: true,
            trackingID: "",
            deliveryDate: "",
            signatureRequired: false,
            oosConsolidate: 3,
            userSessionId: ""
        },
    };
};
