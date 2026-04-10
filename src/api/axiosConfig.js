import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://75ymkt.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// İstek gönderilmeden önce token'ı header'a ekle
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

// Cevap gelince kontrol et — 401 ise logout yap
apiClient.interceptors.response.use(
    (response) => response, // Başarılıysa direkt geç
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token süresi dolmuş veya geçersiz
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            // Login sayfasına yönlendir
            window.location.href = "/auth/giris";
        }
        return Promise.reject(error);
    }
);

export default apiClient;