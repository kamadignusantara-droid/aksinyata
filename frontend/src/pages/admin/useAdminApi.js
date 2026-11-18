import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { makeAuthAxios } from "@/lib/api";

export const useAdminApi = () => {
  const { getToken } = useAuth();
  return useMemo(() => makeAuthAxios(() => getToken()), [getToken]);
};

export const errMsg = (e) => e?.response?.data?.detail || e?.message || "Terjadi kesalahan";
