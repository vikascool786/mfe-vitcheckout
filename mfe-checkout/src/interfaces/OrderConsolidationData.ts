export interface OrderConsolidationData {
    showOrderConsolidate: boolean;
    availabilityDate: string;
    oosConsolidate: number;
    shipDateMessageMap: Map<string, string>;
}

export const OOS_CONSOLIDATE_CODE = 3
export const OOS_CONSOLIDATE_SPLIT_CODE = 2