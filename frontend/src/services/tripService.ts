import axios from "axios";
import { Trip } from "../pages/admin/AdminTrips";
// import { Trip } from "../types";

const API_URL = import.meta.env.VITE_API_URL + "/api/trips";

export const getTrips = async (params?: any) => {
  const res = await axios.get<Trip[]>(API_URL, { params });
  return res.data;
};

export const getTripStats = async () => {
  const res = await axios.get(API_URL + "/stats/analytics");
  return res.data;
};

export const createTrip = async (trip: Partial<Trip>) => {
  const res = await axios.post(API_URL, trip);
  return res.data;
};

export const updateTrip = async (id: string, trip: Partial<Trip>) => {
  const res = await axios.put(`${API_URL}/${id}`, trip);
  return res.data;
};

export const deleteTrip = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export const importTripsCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(API_URL + "/import-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const createReservation = async (reservation: any) => {
  const res = await axios.post(
    import.meta.env.VITE_API_URL + "/api/reservations",
    reservation
  );
  return res.data;
};

export const updateTripDrivers = async (id: string, drivers: string[]) => {
  const res = await axios.put(`${API_URL}/${id}/drivers`, { drivers });
  return res.data;
};

export const bulkUpdateTripPrices = async (data: {
  startDate: string;
  endDate: string;
  type: string;
  value: number;
  from?: string;
  to?: string;
  bus_id?: string;
  all?: boolean;
}) => {
  const res = await axios.post(API_URL + "/bulk-update-price", data);
  return res.data;
};
