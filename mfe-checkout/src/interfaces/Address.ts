
export interface Address {
  isShip: number
  isBill: number
  isPrimary: number
  hasAddress: number
  id: number
  description: string
  prefix: string
  first: string
  mi: string
  last: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  region: string
  zip: string
  country: string
  phone: string
  address3: string
  address4: string
  address5: string
  address6: string
  address7: string
  zone: number
  isPoBox: boolean
  shopperAccountDisabled: number
  links: Links
  isoalpha3Code?: string
  hashCode?: string
}

export interface Links {
  rel: string
  href: string
  type: string
}
