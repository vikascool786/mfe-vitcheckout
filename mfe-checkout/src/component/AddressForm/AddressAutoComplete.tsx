import React, { useEffect } from "react";
import { useFormikContext } from "formik";

interface IAddressAutoComplete {
    enableAddressSuggestions: boolean;
    country: string;
}

export const AddressAutocomplete: React.FC<IAddressAutoComplete> = ({
    enableAddressSuggestions,
    country
}) => {
    const { setFieldValue } = useFormikContext();

    const getAddressComponent = (place: any, type: string, useShortName: boolean): string => {
        const component = place.address_components?.find((comp: any) => comp.types.includes(type));
        return component ? (useShortName ? component.short_name : component.long_name) : "";
    };

    useEffect(() => {
        if (!window.google || !window.google.maps) return;

        if (enableAddressSuggestions) {
            const addressInput = document.querySelector(".js-ship-address1") as HTMLInputElement;
            const phoneInput = document.querySelector(".js-ship-phone") as HTMLInputElement;

            if (!addressInput) return;

            const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
                types: ["geocode"],
                componentRestrictions: { country: country },
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();

                if (place.address_components) {
                    const streetNumber = getAddressComponent(place, "street_number", false);
                    const route = getAddressComponent(place, "route", false);
                    const city = getAddressComponent(place, "locality", false);
                    const state = getAddressComponent(place, "administrative_area_level_1", true);
                    const zip = getAddressComponent(place, "postal_code", false);

                    const street = streetNumber ? `${streetNumber} ${route}` : route;

                    // Update Formik fields
                    setFieldValue("address1", street);
                    setFieldValue("city", city);
                    setFieldValue("state", state);
                    setFieldValue("zip", zip);

                    phoneInput.focus();
                }
            });
        }
    }, [enableAddressSuggestions, setFieldValue]);

    return null;
};
