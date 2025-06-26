import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/drivers";

export const getDrivers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createDriver = async (driver: any) => {
  const res = await axios.post(API_URL, driver);
  return res.data;
};

export const updateDriver = async (id: string, driver: any) => {
  const res = await axios.put(`${API_URL}/${id}`, driver);
  return res.data;
};

export const deleteDriver = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export const getAvailableDrivers = async () => {
  const res = await axios.get(API_URL + "/available");
  return res.data;
};
