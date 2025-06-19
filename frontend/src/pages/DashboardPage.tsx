import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { mockReservations, mockTrips } from "../data/mockData";
import { Reservation, Trip } from "../types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getTripStats } from "../services/tripService";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const reservations = mockReservations.filter((r) => r.userId === user.id);
      setUserReservations(reservations);
    }

    // Show success message if coming from booking
    if (location.state?.message) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    const fetchStats = async () => {
      const data = await getTripStats();
      setStats(data);
    };
    fetchStats();
  }, [user, location.state]);

  const getTripDetails = (tripId: string): Trip | undefined => {
    return mockTrips.find((t) => t.id === tripId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Onaylandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return "Beklemede";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
    }
  };

  const handleCancelReservation = (reservationId: string) => {
    const confirmed = window.confirm(
      "Bu rezervasyonu iptal etmek istediğinizden emin misiniz?"
    );
    if (confirmed) {
      const reservationIndex = mockReservations.findIndex(
        (r) => r.id === reservationId
      );
      if (reservationIndex !== -1) {
        mockReservations[reservationIndex].status = "cancelled";
        setUserReservations((prev) =>
          prev.map((r) =>
            r.id === reservationId ? { ...r, status: "cancelled" } : r
          )
        );
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{location.state?.message}</p>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Hoş geldiniz, {user?.firstName}!
            </h1>
            <p className="text-blue-100 mt-1">
              Rezervasyonlarınızı buradan yönetebilirsiniz
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/trips"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Yeni Bilet Al</h3>
              <p className="text-sm text-gray-600">Seferlerimizi inceleyin</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profil Ayarları</h3>
              <p className="text-sm text-gray-600">Bilgilerinizi güncelleyin</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Toplam Rezervasyon
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {userReservations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rezervasyonlarınız
          </h2>
        </div>

        {userReservations.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Henüz rezervasyonunuz yok
            </h3>
            <p className="text-gray-600 mb-4">
              İlk biletinizi almak için seferlerimizi inceleyin
            </p>
            <Link
              to="/trips"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Bilet Al
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userReservations.map((reservation) => {
              const trip = getTripDetails(reservation.tripId);
              if (!trip) return null;

              return (
                <div key={reservation.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.origin} → {trip.destination}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(reservation.status)}
                            <span>{getStatusText(reservation.status)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(
                              new Date(trip.departureDate),
                              "dd MMMM yyyy",
                              { locale: tr }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{trip.departureTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>
                            Koltuk: {reservation.seatNumbers.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>₺{reservation.totalPrice}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        Rezervasyon:{" "}
                        {format(
                          new Date(reservation.bookingDate),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {reservation.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleCancelReservation(reservation.id)
                          }
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          İptal Et
                        </button>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Detaylar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
