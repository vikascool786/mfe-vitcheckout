export interface Portal {
    portalId: string;
    autoShipDiscount: number;
    hasFreeShipping: boolean;
    hasItransact: boolean;
    distId: string;
}

export const EMPTY_PORTAL: Portal = {
    portalId: "",
    autoShipDiscount: 0,
    hasFreeShipping: false,
    hasItransact: false,
    distId: "",
};