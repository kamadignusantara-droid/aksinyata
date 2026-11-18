import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API_BASE = `${BACKEND_URL}/api`;

export const publicAxios = axios.create({ baseURL: API_BASE });

// authAxios needs a token getter supplied by Clerk's useAuth
export const makeAuthAxios = (getToken) => {
  const inst = axios.create({ baseURL: API_BASE });
  inst.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return inst;
};

export const absUrl = (maybePath) => {
  if (!maybePath) return "";
  if (maybePath.startsWith("http")) return maybePath;
  return `${BACKEND_URL}${maybePath}`;
};
