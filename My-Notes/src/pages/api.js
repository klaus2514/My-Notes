import axios from "axios";

let authToken = localStorage.getItem("token"); // Get the token from localStorage

// Function to refresh the token
const refreshToken = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/refresh-token", {
      token: authToken,
    });
    const newToken = response.data.token;
    localStorage.setItem("token", newToken); // Save the new token
    authToken = newToken; // Update the token in memory
    return newToken;
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    // Redirect to login if token refresh fails
    window.location.href = "/login";
    return null;
  }
};

// Axios interceptor to handle token expiry
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      // Refresh the token
      const newToken = await refreshToken();

      if (newToken) {
        // Update the Authorization header with the new token
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest); // Retry the original request
      }
    }

    return Promise.reject(error);
  }
);

// Function to make authenticated requests
export const fetchNotes = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/notes", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    throw error;
  }
};