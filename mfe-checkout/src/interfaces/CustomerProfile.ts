
export interface CustomerProfile {
  first_name: string;
  last_name: string;
  email_address: string;
  cell_phone: string;
  home_address: CustomerAddress;
}

interface CustomerAddress {
  address_1: string;
  address_2: string;
  address_3: string;
  city: string;
  state: string;
  postal_code: string;
}