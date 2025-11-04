import axios from "axios";

// Vytvoříme instanci Axios s default URL a interceptorem
const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor pro přidání JWT tokenu do každého requestu
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers?.set?.("Authorization", `Bearer ${token}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
