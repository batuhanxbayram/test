import axios from "axios";



const apiClient = axios.create({
    baseURL: "http://72.62.114.221:5000/api",
});


apiClient.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("authToken");


        if (token) {

            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {

        return Promise.reject(error);
    }
);

export default apiClient;