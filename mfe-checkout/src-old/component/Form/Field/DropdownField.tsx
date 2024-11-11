import React, {useState} from 'react';
import {DropdownOption} from "../../../interfaces/DropdownOption";

type DropdownProps = {
    options: DropdownOption[];
    label?: string;
    required?: boolean;
    selectedValue?: string;
    formName?: string;
};

export const DropdownField: React.FC<DropdownProps> = ({ options, label, required, selectedValue, formName }) => {
    const [selectedOption, setSelectedOption] = useState<string>(selectedValue ?? options[0]?.value ?? "");

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div className="field-item-container">
            {label && <div className={required ? "required-field" : ""}>{label}</div>}
            <select className="input-container" name={formName} value={selectedOption} onChange={handleSelectChange}>
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};