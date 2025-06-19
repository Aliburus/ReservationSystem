import axios from "axios";
import { Passenger } from "../types";

const API_URL = "/api/passengers";

export const getPassengers = async (params?: any) => {
  const res = await axios.get<Passenger[]>(API_URL, { params });
  return res.data;
};

export const createPassenger = async (passenger: Partial<Passenger>) => {
  const res = await axios.post(API_URL, passenger);
  return res.data;
};

export const updatePassenger = async (
  id: string,
  passenger: Partial<Passenger>
) => {
  const res = await axios.put(`${API_URL}/${id}`, passenger);
  return res.data;
};

export const deletePassenger = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
