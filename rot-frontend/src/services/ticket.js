import API from "./api";

// Book a ticket (public endpoint, no auth needed)
export const bookTicket = async (ticketData) => {
  try {
    const response = await API.post("/book-ticket", ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Ticket booking failed" };
  }
};

// Search available cars for a location
export const searchAvailableCars = async (locationId) => {
  try {
    const response = await API.get(`/available-cars/${locationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Search failed" };
  }
};

// Get all tickets (admin/manager/driver)
export const getTickets = async () => {
  try {
    const response = await API.get("/tickets");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch tickets" };
  }
};

// Verify ticket (station use)
export const verifyTicket = async (verificationCode) => {
  try {
    const response = await API.post("/verify-ticket", { verification_code: verificationCode });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Ticket verification failed" };
  }
};

// Search locations
export const searchLocations = async (from, to) => {
  try {
    const response = await API.get("/search-location", {
      params: { from, to },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Location search failed" };
  }
};

// Get all locations (for manager)
export const getLocations = async () => {
  try {
    const response = await API.get("/locations");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch locations" };
  }
};

// Create location (manager only)
export const createLocation = async (locationData) => {
  try {
    const response = await API.post("/locations", locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create location" };
  }
};

// Update location (manager only)
export const updateLocation = async (locationId, locationData) => {
  try {
    const response = await API.put(`/locations/${locationId}`, locationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update location" };
  }
};

// Delete location (manager only)
export const deleteLocation = async (locationId) => {
  try {
    const response = await API.delete(`/locations/${locationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete location" };
  }
};
