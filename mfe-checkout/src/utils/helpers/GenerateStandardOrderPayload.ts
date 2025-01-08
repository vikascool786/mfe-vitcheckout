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
            applyCashback: false,
            applyEWallet: false,
            isOfAge: true,
            trackingID: "",
            deliveryDate: "",
            deliveryTime: 1,
            signatureRequired: false,
            oosConsolidate: false,
            userSessionId: ""
        },
    };
};
