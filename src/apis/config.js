import axios from "axios";
import { toast } from "sonner";

import { CODE_KEY, STORAGE_KEY } from "@/constants/application";
import { ROUTE_PATH } from "@/constants/routePaths";
import { storage } from "@/helpers/storage";

const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL || "/api";

const REQUEST_TIMEOUT = 15 * 1000;

axios.defaults.timeout = REQUEST_TIMEOUT;

axios.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEY.ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === CODE_KEY.UNAUTHORIZED_STATUS) {
      storage.remove(STORAGE_KEY.ACCESS_TOKEN);
      storage.remove(STORAGE_KEY.REFRESH_TOKEN);
      storage.remove(STORAGE_KEY.USER_INFO);

      toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        window.location.href = ROUTE_PATH.LOGIN;
      }, 1500);
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

const apiCall = async (
  method,
  endpoint,
  data = null,
  customHeaders = {},
  baseUrl = null,
  ...args
) => {
  axios.defaults.baseURL = baseUrl ? baseUrl : VITE_APP_API_URL;
  const url = `${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      ...(args?.[0] || {}),
    });
    return response;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case CODE_KEY.BAD_REQUEST:
          return error.response;
        case CODE_KEY.UNAUTHORIZED_STATUS:
          return error.response;
        case CODE_KEY.REQUEST_ENTITY_TOO_LARGE:
          return error.response;
        default:
          break;
      }
    }

    if (error.code === CODE_KEY.CANCEL) {
      console.warn("--------CANCEL--------", error);
      return {
        data: {
          isSuccess: false,
          isCancel: true,
        },
      };
    }

    if (error.code === CODE_KEY.ERROR_NETWORK) {
      const isFormData = error?.config?.data instanceof FormData;
      if (isFormData) {
        return { status: CODE_KEY.REQUEST_ENTITY_TOO_LARGE };
      }
    }

    console.error(error);
  }
};

export default apiCall;
