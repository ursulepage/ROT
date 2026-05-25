import API from "./api";

// Login for Admin, Manager, Driver, Station
export const login = async (identifier, password) => {
  try {
    const response = await API.post("/login", { identifier, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Login failed" };
  }
};

// Get profile data (Company, Driver, Station info based on role)
export const getProfile = async (userId) => {
  try {
    const response = await API.get(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch profile" };
  }
};

// Update profile with avatar
export const updateProfile = async (userId, formData) => {
  try {
    const response = await API.put(`/update-profile/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update profile" };
  }
};

// Upload avatar
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const response = await API.post("/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Avatar upload failed" };
  }
};
