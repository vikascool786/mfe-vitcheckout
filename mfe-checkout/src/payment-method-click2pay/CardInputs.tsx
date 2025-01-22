import React from "react";
import { DropdownField } from "../component/Form/Field/DropdownField";
import { FormField } from "../component/Form/Field/FormField";
import "../payment-method/card-information/CardInformation.scss";

export const CardInputs: React.FC = () => {
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
                name="name"
            />
            <FormField
                label="Card Number"
                required
                name="number"
            />
            <div className="form-field-container">
                <DropdownField
                    label="Expiration Month"
                    formName="month"
                    options={[...Array(12)].map((_, i) => ({
                        value: (i + 1).toString().padStart(2, "0"),
                        label: (i + 1).toString().padStart(2, "0"),
                    }))}
                />
                <DropdownField
                    label="Expiration Year"
                    formName="year"
                    options={years}
                />
            </div>
            <FormField
                label="CVV"
                required
                name="cvv"
                type="password"
            />
        </>
    );
};
