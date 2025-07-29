import React, { createContext, useState, useContext, ReactNode } from "react";

export interface CreditCardFormData {
    cardInfo : {
        accountName: string;
        number: string;
        expMonth: string;
        expYear: string;
        cvv: string;
    }
    first?: string;
    last?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string
    saveForLater: boolean;
    addressId?: number;
}

interface FormContextType {
    creditCardFormData: CreditCardFormData;
    setCreditCardFormData: React.Dispatch<React.SetStateAction<CreditCardFormData>>;
}

// Create Context with default value
const CreditCardFormContext = createContext<FormContextType | undefined>(undefined);

export const CreditCardFormProvider = ({ children }: { children: ReactNode }) => {
    const [creditCardFormData, setCreditCardFormData] = useState<CreditCardFormData>({ cardInfo: {
            accountName: "",
            number: "",
            expMonth: "",
            expYear: "",
            cvv: "",
        },
        first: "",
        last: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        saveForLater: true
    });

    return (
        <CreditCardFormContext.Provider value={{ creditCardFormData, setCreditCardFormData }}>
            {children}
        </CreditCardFormContext.Provider>
    );
};

export const useCreditCardFormContext = () => {
    const context = useContext(CreditCardFormContext);
    if (!context) {
        throw new Error("useCreditCardFormContext must be used within a FormProvider");
    }
    return context;
};
