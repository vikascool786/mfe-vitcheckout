import { GET_API_ENDPOINT_BASE_URL } from "../../utils/ApiConstants";
import axiosInstance from "../axios";

export const postAVS = async (
  shpAddr1: string,
  shpAddr2: string,
  shpCity: string,
  shpState: string,
  shpPCode: string,
  addressHash: string
): Promise<any> => {
  const apiEndpoint = GET_API_ENDPOINT_BASE_URL + "/avs/v1/hash";

  try {
    const avsResponse = await axiosInstance(apiEndpoint).post("", {
      shpAddr1: shpAddr1,
      shpAddr2: shpAddr2,
      shpCity: shpCity,
      shpState: shpState,
      shpPCode: shpPCode,
      addressHash: addressHash,
    });
    console.log(avsResponse);
    return avsResponse;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
