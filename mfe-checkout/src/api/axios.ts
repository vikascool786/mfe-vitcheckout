import axios from "axios";

const axiosInstance = (baseUrl: string) =>
    axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-Type": "application/json",
        },
    });

export default axiosInstance;
