import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_BASE_URL}`,
  timeout: 15000,
  withCredentials: true,
});

export default api;
