export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  busPlate: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  busType: string;
  duration: string;
}

export interface Bus {
  id: string;
  plate: string;
  type: string;
  totalSeats: number;
  seatLayout: SeatLayout;
}

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  aisleAfter: number[];
  unavailableSeats: number[];
}

export interface Reservation {
  id: string;
  userId: string;
  tripId: string;
  seatNumbers: number[];
  passengerName: string;
  passengerPhone: string;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
  bookingDate: string;
  paymentMethod: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface Passenger {
  _id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}
