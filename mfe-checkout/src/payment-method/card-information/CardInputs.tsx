import React from "react";
import { DropdownField } from "../../component/Form/Field/DropdownField";
import { FormField } from "../../component/Form/Field/FormField";
import "./CardInformation.scss";

interface ICardInputProps {
    touched: any;
    errors: any;
    handleChange: any;
    values: any;
    handleBlur: any;
}

export const CardInputs: React.FC<ICardInputProps> = ({ touched, errors, handleChange, values, handleBlur }) => {
    const getYears = (startYear: number, endYear: number) =>
        Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
            value: `${startYear + i}`,
            label: `${startYear + i}`,
        }));

    const currentYear = new Date().getFullYear();
    const years = getYears(currentYear, currentYear + 10);

    return (
        <>
            <FormField
                label="Name on Card"
                required
                name="cardInfo.accountName"
                value={values.accountName}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.cardInfo?.accountName && errors.cardInfo?.accountName}
            />
            <FormField
                label="Card Number"
                required
                name="cardInfo.number"
                value={values.number}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.cardInfo?.number && errors.cardInfo?.number}
            />
            <div className="form-field-container">
                <DropdownField
                    label="Expiration Month"
                    formName="cardInfo.expMonth"
                    selectedValue={values.expMonth?.toString()}
                    options={[...Array(12)].map((_, i) => ({
                        value: (i + 1).toString().padStart(2, "0"),
                        label: (i + 1).toString().padStart(2, "0"),
                    }))}
                    onChange={(value) => handleChange("cardInfo.expMonth")(value)}
                    errorMessage={touched.cardInfo?.expMonth && errors.cardInfo?.expMonth}
                />
                <DropdownField
                    label="Expiration Year"
                    formName="cardInfo.expYear"
                    selectedValue={values.expYear?.toString()}
                    options={years}
                    onChange={(value) => handleChange("cardInfo.expYear")(value)}
                    errorMessage={touched.cardInfo?.expYear && errors.cardInfo?.expYear}
                />
            </div>
            <FormField
                label="CVV"
                required
                name="cardInfo.cvv"
                type="password"
                value={values.cvv}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={touched.cardInfo?.cvv && errors.cardInfo?.cvv}
            />
        </>
    );
};
