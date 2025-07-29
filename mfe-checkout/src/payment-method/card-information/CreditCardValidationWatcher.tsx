import React, { useEffect } from "react";
import {CreditCardFormData, useCreditCardFormContext} from "../../component/Form/CreditCardFormContext";
import {Address} from "../../interfaces/Address";

interface ICreditCardValidationWatcher {
    isValid: boolean;
    values: any;
    isShipSameAsBill: boolean;
    shipAddress: any;
    saveForLater: boolean;
}

export const CreditCardValidationWatcher: React.FC<ICreditCardValidationWatcher> = ({ isValid, values, isShipSameAsBill, shipAddress, saveForLater }) => {

    const { setCreditCardFormData } = useCreditCardFormContext();

    useEffect(() => {
        const resetFormData = {cardInfo: {accountName: "",
                number: "", expMonth: "",
                expYear: "", cvv: ""}, saveForLater: false};

        if(isValid && values.cardInfo.number.length > 0){
            if(!isShipSameAsBill && values.first.length < 1){ //handle case where all cc info is entered and then "same as shipping" is unchecked
                setCreditCardFormData(resetFormData);
            } else{
                const address = !isShipSameAsBill
                    ? {
                        first: values.first,
                        last: values.last,
                        address1: values.address1,
                        address2: values.address2,
                        city: values.city,
                        state: values.state,
                        zip: values.zip,
                        phone: values.phone,
                    }
                    : (shipAddress as Address);

                let ccFormData: CreditCardFormData = {cardInfo: {accountName: values.cardInfo.accountName,
                        number: values.cardInfo.number, expMonth: values?.cardInfo?.expMonth?.toString(),
                        expYear: values?.cardInfo?.expYear?.toString(), cvv: values.cardInfo.cvv}, saveForLater: saveForLater}

                if(isShipSameAsBill && shipAddress?.id){
                    ccFormData.addressId = shipAddress.id;
                } else {
                    ccFormData.first = address?.first;
                    ccFormData.last = address?.last;
                    ccFormData.address1 = address?.address1;
                    ccFormData.address2 = address?.address2;
                    ccFormData.city = address?.city;
                    ccFormData.state = address?.state;
                    ccFormData.zip = address?.zip;
                    ccFormData.phone = address?.phone;
                }

                setCreditCardFormData(ccFormData);
            }
        } else {
            setCreditCardFormData(resetFormData);
        }
    }, [isValid, values, isShipSameAsBill, shipAddress, saveForLater]);

    return null;
};