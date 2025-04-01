import {Address} from "../interfaces/Address";

export const getFilteredShippingAddresses = (addressList: Address[]): Address[] => {
    return addressList?.filter((ad) => ad.hasAddress !== 0 && ad.isBill !== 1 && ad.isPrimary !== 1);
};

export const getShippingAddressFromAddressList = (addressList: Address[]): Address | undefined => {
    const filteredAddressList = getFilteredShippingAddresses(addressList);
    return filterForShippingAddress(filteredAddressList);
};

export const getShippingAddressFromFilteredList = (filteredAddressList: Address[]): Address | undefined => {
    return filterForShippingAddress(filteredAddressList);
};

const filterForShippingAddress = (addressList: Address[]): Address | undefined => {
    return addressList?.find((address) => address?.isShip === 1) ?? addressList[0];
};