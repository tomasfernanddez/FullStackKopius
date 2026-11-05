import env from "../../config/env.config.js";

const request = async (method, path, body, options = {}) => {
    const headers = {
        Accept: "application/json",
        ...options.headers,
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${env.reqresBaseUrl}${path}`, {
        ...options,
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options.signal ?? AbortSignal.timeout(5000),
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    if (response.status === 204) {
    return null;
  }

  return response.json();

};

const fetchAdapter = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
};

export default fetchAdapter;
