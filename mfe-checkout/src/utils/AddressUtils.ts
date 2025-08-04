import {Address} from "../interfaces/Address";

const DEFAULT_MA_ADDRESS: Address = {
    first: "SHOP.COM",
    last: "",
    address1: "1302 Pleasant Ridge Road",
    city: "Greensboro",
    state: "NC",
    zip: "27409"
}

export const getFilteredShippingAddresses = (addressList: Address[], countryCode: string): Address[] => {
    return addressList?.filter((ad) =>
        ad.hasAddress !== 0 &&
        ad.isoalpha3Code === countryCode &&
        !(ad.isBill === 1 && ad.isShip !== 1) &&
        !(ad.isPrimary === 1 && ad.isShip !== 1)
    );
};

export const getShippingAddressFromAddressList = (addressList: Address[], countryCode: string): Address | undefined => {
    const filteredAddressList = getFilteredShippingAddresses(addressList, countryCode);
    return filterForShippingAddress(filteredAddressList);
};

export const getShippingAddressFromFilteredList = (filteredAddressList: Address[]): Address | undefined => {
    return filterForShippingAddress(filteredAddressList);
};

const filterForShippingAddress = (addressList: Address[]): Address | undefined => {
    return addressList?.find((address) => address?.isShip === 1) ?? addressList[0];
};

export const isAddressDefaultMAAddress = (address: Address): boolean => {
    if (!address) return false;
    return (
        address?.id === 0 ||
        (DEFAULT_MA_ADDRESS.first === address.first &&
        DEFAULT_MA_ADDRESS.last === address.last &&
        DEFAULT_MA_ADDRESS.address1 === address.address1 &&
        DEFAULT_MA_ADDRESS.city === address.city &&
        DEFAULT_MA_ADDRESS.state === address.state &&
        DEFAULT_MA_ADDRESS.zip === address.zip)
    );
};

export const setAddressAsShipInAddressList = (addressList: Address[], shipAddress: Address): Address[] => {
    return addressList.map(address => ({
        ...address,
        isShip: address.id === shipAddress.id ? 1 : 0,
    }));
}