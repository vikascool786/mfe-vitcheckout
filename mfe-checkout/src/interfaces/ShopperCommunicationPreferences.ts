export interface ShopperCommunicationPreferences {
    preferences: Preference[];
}

export interface Preference {
    customerPreferenceID: number;
    preferenceCode: number;
    preference: string;
    grouping: number;
    type: number;
    optIn: number;
}

export const SHOP_SHIP_UPDATE_TEXT_PREF_CODE = 20;