import axios from "axios";

const axiosInstance = (baseUrl: string) =>
  axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

export default axiosInstance;
