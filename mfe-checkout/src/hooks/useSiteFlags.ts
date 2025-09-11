import { useAtom } from "jotai";
import { siteFlagsAtom } from "../store";
import { thirdPartyPaymentFlagList } from "../payment-method/PaymentType";
import { SiteFlags } from "../interfaces/SiteFlags";
import { fetchSiteFlagData } from "../api/service/SiteFlags";

export const useSiteFlags = () => {
  const [siteFlags, setSiteFlags] = useAtom(siteFlagsAtom);

  const fetchSiteFlagInfo = async (siteId: string = "") => {
    const siteFlagList = thirdPartyPaymentFlagList();
    siteFlagList.push(646);
    const joinedSiteFlagList = siteFlagList.join(",");

    try {
      const response: SiteFlags[] = await fetchSiteFlagData(
        siteId,
        joinedSiteFlagList
      );
      setSiteFlags(response);
    } catch (error) {
      console.error("Failed to fetch siteflag data:", error);
    }
  };

  return {
    fetchSiteFlagInfo,
    siteFlags
  };
};