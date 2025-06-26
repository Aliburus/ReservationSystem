import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/reservations";

export const getReservations = async (params?: any) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const createReservation = async (reservation: any) => {
  const res = await axios.post(API_URL, reservation);
  return res.data;
};

export const updateReservation = async (id: string, reservation: any) => {
  const res = await axios.put(`${API_URL}/${id}`, reservation);
  return res.data;
};

export const deleteReservation = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
