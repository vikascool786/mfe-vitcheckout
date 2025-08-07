
export interface CustomerProfile {
  first_name: string;
  last_name: string;
  email_address: string;
  cell_phone: string;
  home_address: CustomerAddress;
  pc_types: PcType[];
}

interface CustomerAddress {
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  state: string;
  postal_code: string;
}

interface PcType {
  pc_type: string;
  enabled: boolean;
}

export const isEZRegShopper = (profile: CustomerProfile | null): boolean => {
  if (!profile) return false;

  if(!profile.pc_types){
    return profile.last_name.toUpperCase() === "EZREG";
  }else {
    return profile.pc_types.some(
        (type) => type.pc_type === "isEZ" && type.enabled
    )
  }
};