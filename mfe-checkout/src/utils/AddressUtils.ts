import {Address} from "../interfaces/Address";

export const getFilteredShippingAddresses = (addressList: Address[], countryCode: string): Address[] => {
    return addressList?.filter((ad) => ad.hasAddress !== 0 && ad.isBill !== 1 && ad.isPrimary !== 1 && ad.isoalpha3Code === countryCode);
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