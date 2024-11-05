import React from 'react';
import {DropdownOption} from "../../../interfaces/DropdownOption";

type DropdownProps = {
    options: DropdownOption[];
    label?: string;
    required?: boolean;
};

export const DropdownField: React.FC<DropdownProps> = ({ options, label, required }) => {
    return (
        <div className="field-item-container">
            {label && <div className={required ? "required-field" : ""}>{label}</div>}
            <select className="input-container">
                {options.map((option) => (
                    <option value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};