import { GET_API_ENDPOINT_BASE_URL_ONLY, GET_API_KEY } from "../../utils/urlResolver";
import axiosInstance from "../axios";

export const REG_TYPE_GUEST_CHECKOUT = "guestCheckout";

enum EZ_REG_PROCESS {
  DEFAULT = "EZ-Reg Customer",
  GUEST = "Guest Checkout Customer"
}

enum EZ_REG_INCENTIVE {
  DEFAULT = "",
  GUEST = "GstChkOut"
}

const getEZRegProcessIncentive = (type: string): { process: EZ_REG_PROCESS; incentive: EZ_REG_INCENTIVE } => {
  switch (type) {
    case REG_TYPE_GUEST_CHECKOUT:
      return {
        process: EZ_REG_PROCESS.GUEST,
        incentive: EZ_REG_INCENTIVE.GUEST,
      };
    default:
      return {
        process: EZ_REG_PROCESS.DEFAULT,
        incentive: EZ_REG_INCENTIVE.DEFAULT,
      };
  }
}

export const postEZReg = async (
    email: string,
    portalId: string,
    ezRegType: string,
    optIn: boolean,
): Promise<any> => {
  try {
    const apiEndpoint = `${GET_API_ENDPOINT_BASE_URL_ONLY()}/shopper-ezregs/v3/EZReg?api_key=${GET_API_KEY()}`;
    const ezRegProcessIncentiveData = getEZRegProcessIncentive(ezRegType);
    const ezRegResponse = await axiosInstance(apiEndpoint).post("", {
      email: email,
      portalname: portalId,
      processName: ezRegProcessIncentiveData.process,
      regIncentive: ezRegProcessIncentiveData.incentive,
      optIn: optIn
    }, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;v=2",
      },
    });
    return ezRegResponse.data;
  } catch (error: any) {
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Error registering shopper email.";
    console.error(`Error creating EZ Reg for email: ${email}`, error);
    throw new Error(message);
  }
};