import API from "./api";

// ============= CARS MANAGEMENT =============
export const getCars = async () => {
  try {
    const response = await API.get("/cars");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch cars" };
  }
};

export const createCar = async (carData) => {
  try {
    const response = await API.post("/cars", carData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create car" };
  }
};

export const updateCar = async (carId, carData) => {
  try {
    const response = await API.put(`/cars/${carId}`, carData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update car" };
  }
};

export const deleteCar = async (carId) => {
  try {
    const response = await API.delete(`/cars/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete car" };
  }
};

// ============= DRIVERS MANAGEMENT =============
export const getDrivers = async () => {
  try {
    const response = await API.get("/drivers");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch drivers" };
  }
};

export const createDriver = async (driverData) => {
  try {
    const response = await API.post("/drivers", driverData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create driver" };
  }
};

export const updateDriver = async (driverId, driverData) => {
  try {
    const response = await API.put(`/drivers/${driverId}`, driverData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update driver" };
  }
};

export const deleteDriver = async (driverId) => {
  try {
    const response = await API.delete(`/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete driver" };
  }
};

// ============= STATIONS MANAGEMENT =============
export const getStations = async () => {
  try {
    const response = await API.get("/stations");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch stations" };
  }
};

export const createStation = async (stationData) => {
  try {
    const response = await API.post("/stations", stationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create station" };
  }
};

export const updateStation = async (stationId, stationData) => {
  try {
    const response = await API.put(`/stations/${stationId}`, stationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update station" };
  }
};

export const deleteStation = async (stationId) => {
  try {
    const response = await API.delete(`/stations/${stationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete station" };
  }
};

// ============= LAUNCH CARS (SCHEDULED TRIPS) =============
export const getLaunchCars = async () => {
  try {
    const response = await API.get("/launch-cars");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch launch cars" };
  }
};

export const createLaunchCar = async (launchData) => {
  try {
    const response = await API.post("/launch-cars", launchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create launch car" };
  }
};

export const updateLaunchCar = async (launchId, launchData) => {
  try {
    const response = await API.put(`/launch-cars/${launchId}`, launchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to update launch car" };
  }
};

export const deleteLaunchCar = async (launchId) => {
  try {
    const response = await API.delete(`/launch-cars/${launchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to delete launch car" };
  }
};
