export interface Address {
    id: number;
    isPrimary: boolean;
    first: string;
    last: string;
    address1: string;
    address2: string;
    zip: string;
    city: string;
    state: string;
    phone: string;
    country?: string;
}