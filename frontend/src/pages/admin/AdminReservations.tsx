import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import {
  getReservations,
  updateReservation,
} from "../../services/reservationService";
import { getTrips } from "../../services/tripService";
import Spinner from "../../components/Common/Spinner";
import { Link } from "react-router-dom";

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const resData = await getReservations();
      setReservations(resData);
      const tripData = await getTrips();
      setTrips(tripData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const trip = trips.find((t) => t._id === reservation.trip_id);
    const matchesSearch =
      (reservation.first_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (reservation.last_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (reservation.phone || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip &&
        ((trip.from || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (trip.to || "").toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = !statusFilter || reservation.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      (reservation.created_at &&
        reservation.created_at.slice(0, 10) === dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredReservations.length / pageSize);

  const handleUpdateReservationStatus = async (
    reservationId: string,
    newStatus: "active" | "cancelled"
  ) => {
    await updateReservation(reservationId, { status: newStatus });
    setReservations((prev) =>
      prev.map((r) =>
        r._id === reservationId ? { ...r, status: newStatus } : r
      )
    );
    // Eğer koltuk haritası varsa, burada da TripDetailPage'deki gibi occupiedSeats güncellenmeli
    // (Varsa) setOccupiedSeats(prev => prev.filter(...)) gibi bir kod eklenebilir.
  };

  const handleCancelReservation = (reservationId: string) => {
    if (
      window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")
    ) {
      handleUpdateReservationStatus(reservationId, "cancelled");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "cancelled":
        return "İptal Edildi";
      default:
        return "Beklemede";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
    }
  };

  const activeCount = reservations.filter((r) => r.status === "active").length;
  const cancelledCount = reservations.filter(
    (r) => r.status === "cancelled"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Rezervasyon Yönetimi
            </h1>
            <p className="text-gray-600 mt-2">
              Tüm rezervasyonları görüntüleyin ve yönetin
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Rezervasyon
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    İptal Edilen
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cancelledCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rezervasyon ara (ad, soyad, telefon, güzergah)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="cancelled">İptal Edilen</option>
                    <option value="all">Tüm durumlar</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Rezervasyonlar ({filteredReservations.length})
              </h2>
            </div>

            {filteredReservations.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rezervasyon bulunamadı
                </h3>
                <p className="text-gray-600">
                  Arama kriterlerinizi değiştirerek tekrar deneyin.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ad Soyad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sefer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Koltuk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedReservations.map((reservation) => {
                      const trip = trips.find(
                        (t) => t._id === reservation.trip_id
                      );

                      return (
                        <tr key={reservation._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.first_name} {reservation.last_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                {reservation.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {trip && (
                              <Link
                                to={`/admin/trips/${trip._id}`}
                                className="text-blue-600 hover:underline flex items-center text-sm font-medium"
                              >
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                {trip.from} → {trip.to}
                              </Link>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reservation.seat_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                reservation.status
                              )}`}
                            >
                              {getStatusIcon(reservation.status)}
                              <span className="ml-1">
                                {getStatusText(reservation.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reservation.created_at
                                ? format(
                                    new Date(reservation.created_at),
                                    "dd/MM/yyyy HH:mm"
                                  )
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {reservation.status === "active" && (
                                <button
                                  onClick={() =>
                                    handleCancelReservation(reservation._id)
                                  }
                                  className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                                >
                                  İptal Et
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center my-6 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600 border-blue-300"
                  } font-semibold`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReservations;
