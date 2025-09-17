export interface ShopperDirectory {
  shopperID: string;
  shopperType: number;
  shopperAccountDisabled: number;
  foreign: boolean;
}

const SHOPPER_TYPE_FULL = 0;
const SHOPPER_TYPE_EZ = 1;

export const isFullRegShopper = (directoryResponse: ShopperDirectory): boolean => {
  return directoryResponse?.shopperType === SHOPPER_TYPE_FULL;
};

export const isInvalidShopper = (directoryResponse: ShopperDirectory): boolean => {
  return directoryResponse?.shopperType !== SHOPPER_TYPE_FULL && directoryResponse?.shopperType !== SHOPPER_TYPE_EZ;
};

export const isEZRegShopper = (directoryResponse: ShopperDirectory): boolean => {
  return directoryResponse?.shopperType === SHOPPER_TYPE_EZ;
};