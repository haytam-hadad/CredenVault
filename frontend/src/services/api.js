import axios from "axios";  
  
const api = axios.create({  
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",  
  withCredentials: true,  
  headers: { "Content-Type": "application/json" },  
});  
  
api.interceptors.response.use(  
  (response) => response.data,  
  (error) => {  
    const message =  
      error.response?.data?.message ||  
      error.message ||  
      "Une erreur est survenue";  
  
    const credentialCheckEndpoints = [  
      "/auth/login",  
      "/users/password",  
      "/auth/2fa/disable",  
      "/auth/verify-password",  
      "/auth/2fa/recovery-codes/regenerate",  
    ];  
    const isCredentialCheck = credentialCheckEndpoints.some((path) =>  
      error.config?.url?.includes(path),  
    );  
  
    if (error.response?.status === 401 && !isCredentialCheck) {  
      if (  
        !window.location.pathname.startsWith("/login") &&  
        !window.location.pathname.startsWith("/register")  
      ) {  
        window.location.href = "/login";  
      }  
    }  
  
    return Promise.reject(new Error(message));  
  },  
);  
  
export default api;