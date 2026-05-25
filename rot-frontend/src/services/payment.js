import API from "./api";

// Fake payment for testing
export const fakePayment = async (amount) => {
  try {
    const response = await API.post("/fake-payment", { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Payment processing failed" };
  }
};

// Get payments (manager/admin)
export const getPayments = async () => {
  try {
    const response = await API.get("/payments");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch payments" };
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await API.get("/dashboard");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch dashboard data" };
  }
};
