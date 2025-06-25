import axios from "axios";
// import { Bus } from "../types";

const API_URL = import.meta.env.VITE_API_URL + "/api/buses";

export const getBuses = async (params?: any) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const createBus = async (bus: any) => {
  const res = await axios.post(API_URL, bus);
  return res.data;
};

export const updateBus = async (id: string, bus: any) => {
  const res = await axios.put(`${API_URL}/${id}`, bus);
  return res.data;
};

export const deleteBus = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
