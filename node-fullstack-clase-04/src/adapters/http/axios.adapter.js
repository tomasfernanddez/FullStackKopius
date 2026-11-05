import axios from "axios";
import env from "../../config/env.config.js";

const client = axios.create({
  baseURL: env.reqresBaseUrl,
  timeout: 5000,
  headers: {
    Accept: "application/json",
  },
});

const request = async (config) => {
  try {
    const response = await client.request(config);

    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP error: ${error.response.status}`);
    }

    throw new Error(error.message);
  }
};

const axiosAdapter = {
  get: (path, options) => request({ ...options, method: "GET", url: path }),
  post: (path, body, options) => request({ ...options, method: "POST", url: path, data: body }),
  put: (path, body, options) => request({ ...options, method: "PUT", url: path, data: body }),
  patch: (path, body, options) => request({ ...options, method: "PATCH", url: path, data: body }),
  delete: (path, options) => request({ ...options, method: "DELETE", url: path }),
};

export default axiosAdapter;