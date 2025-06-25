import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Filter, Calendar } from "lucide-react";
// import { mockBuses, cities } from "../../data/mockData";
import TripCard from "../../components/Common/TripCard";
import {
  getTrips,
  createTrip,
  deleteTrip as deleteTripApi,
  updateTrip,
} from "../../services/tripService";
import { getBuses } from "../../services/busService";
import SeatMap from "../../components/Common/SeatMap";
import { useNavigate } from "react-router-dom";
import { getReservations } from "../../services/reservationService";

// cities arrayini burada tanımla
const cities: string[] = [
  "Adana",
  "Adıyaman",
  "Afyon",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

export interface Trip {
  _id?: string;
  bus_id: string;
  from: string;
  to: string;
  date: string;
  price: number;
  status?: "active" | "cancelled";
  // Frontend için ek alanlar:
  origin?: string;
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  busPlate?: string;
  totalSeats?: number;
  availableSeats?: number;
  busType?: string;
  duration?: string;
}

const AdminTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    date: "",
    busType: "",
  });

  const [newTrip, setNewTrip] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    arrivalTime: "",
    busPlate: "",
    price: 0,
  });

  const [buses, setBuses] = useState<any[]>([]);

  const formRef = useRef<HTMLDivElement>(null);

  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showTripDetail, setShowTripDetail] = useState(false);

  const navigate = useNavigate();

  const fetchTrips = async () => {
    if (!buses || buses.length === 0) return;
    setLoading(true);
    try {
      const data = await getTrips();
      // Tüm rezervasyonları çek
      const allReservations = await Promise.all(
        data.map((trip: any) => getReservations({ trip_id: trip._id }))
      );
      const mapped = data.map((trip: any, idx: number) => {
        const bus = buses.find((b: any) => b._id === trip.bus_id);
        // Aktif rezervasyonları say
        const reservations = Array.isArray(allReservations[idx])
          ? allReservations[idx]
          : [];
        const activeReservations = reservations.filter(
          (r: any) => r.status === "active"
        );
        return {
          ...trip,
          origin: trip.from,
          destination: trip.to,
          departureDate: trip.date ? trip.date.slice(0, 10) : "",
          departureTime: trip.departureTime || "",
          arrivalTime: trip.arrivalTime || "",
          duration: trip.duration || "",
          busPlate: bus ? bus.plate : "",
          totalSeats: bus ? bus.seat_count : 0,
          availableSeats: bus ? bus.seat_count - activeReservations.length : 0,
          busType: bus ? bus.type : "",
        };
      });
      setTrips(mapped);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await getBuses();
        setBuses(data);
      } catch (err) {}
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [buses]);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      (trip.origin || trip.from || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.destination || trip.to || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.busPlate || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters =
      (!filters.origin || (trip.origin || trip.from) === filters.origin) &&
      (!filters.destination ||
        (trip.destination || trip.to) === filters.destination) &&
      (!filters.date || (trip.departureDate || trip.date) === filters.date) &&
      (!filters.busType || trip.busType === filters.busType);

    return matchesSearch && matchesFilters;
  });

  const calculateDuration = (departure: string, arrival: string) => {
    const [depHour, depMin] = departure.split(":").map(Number);
    const [arrHour, arrMin] = arrival.split(":").map(Number);

    let totalMinutes = arrHour * 60 + arrMin - (depHour * 60 + depMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Next day arrival

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Hata mesajı çevirici
  const errorMessageTR = (msg: string) => {
    if (!msg) return "Bilinmeyen bir hata oluştu.";
    if (msg.includes("zincirin son varış noktasından başlamalı"))
      return "Bu otobüs bu tarih ve saatte kullanılamaz.";
    if (msg.includes("zincirin son varıştan en az 6 saat sonra olmalı"))
      return "Bu otobüs bu tarih ve saatte kullanılamaz.";
    if (msg.includes("Varış saati kalkıştan sonra olmalı"))
      return "Varış saati, kalkış saatinden sonra olmalıdır.";
    if (msg.includes("Tarih bugünden önce olamaz"))
      return "Sefer tarihi bugünden önce olamaz.";
    if (msg.includes("Bu otobüs bu tarihte başka bir sefere atanmış"))
      return "Bu otobüs bu tarih ve saatte kullanılamaz.";
    if (msg.includes("Geçersiz otobüs ID")) return "Geçersiz otobüs seçimi.";
    if (
      msg.includes(
        "Kalkış, varış, tarih, fiyat, kalkış saati ve varış saati zorunlu"
      )
    )
      return "Tüm alanları doldurmanız gerekmektedir.";
    return msg;
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        from: newTrip.origin,
        to: newTrip.destination,
        date: newTrip.departureDate,
        price: newTrip.price,
        bus_id: newTrip.busPlate,
        departureTime: newTrip.departureTime,
        arrivalTime: newTrip.arrivalTime,
        duration: calculateDuration(newTrip.departureTime, newTrip.arrivalTime),
      };
      await createTrip(payload);
      const data = await getTrips();
      const mapped = data.map((trip: any) => {
        const bus = (Array.isArray(buses) ? buses : []).find(
          (b) => b._id === trip.bus_id
        );
        return {
          ...trip,
          origin: trip.from,
          destination: trip.to,
          departureDate: trip.date ? trip.date.slice(0, 10) : "",
          departureTime: trip.departureTime || "",
          arrivalTime: trip.arrivalTime || "",
          duration:
            trip.duration ||
            (trip.departureTime && trip.arrivalTime
              ? calculateDuration(trip.departureTime, trip.arrivalTime)
              : ""),
          busPlate: bus ? bus.plate : "",
          totalSeats: bus ? bus.seat_count : 0,
          availableSeats: bus ? bus.seat_count : 0,
          busType: bus ? bus.type : "",
        };
      });
      setTrips(mapped);
      setShowAddForm(false);
      setNewTrip({
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        busPlate: "",
        price: 0,
      });
    } catch (err: any) {
      alert(errorMessageTR(err?.response?.data?.error) || "Sefer eklenemedi!");
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setNewTrip({
      origin: trip.origin || trip.from || "",
      destination: trip.destination || trip.to || "",
      departureDate: trip.departureDate || trip.date || "",
      departureTime: trip.departureTime ? trip.departureTime.slice(0, 5) : "",
      arrivalTime: trip.arrivalTime ? trip.arrivalTime.slice(0, 5) : "",
      busPlate: trip.busPlate || "",
      price: trip.price,
    });
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    try {
      const bus = buses.find((b) => b.plate === newTrip.busPlate);
      if (!bus) return;
      const updatedTrip: any = {
        ...editingTrip,
        origin: newTrip.origin,
        destination: newTrip.destination,
        departureDate: newTrip.departureDate,
        departureTime: newTrip.departureTime,
        arrivalTime: newTrip.arrivalTime,
        busPlate: newTrip.busPlate,
        price: newTrip.price,
        busType: bus.type,
        duration: calculateDuration(newTrip.departureTime, newTrip.arrivalTime),
      };
      // Backend update
      await updateTrip(editingTrip._id, {
        from: newTrip.origin,
        to: newTrip.destination,
        date: newTrip.departureDate,
        price: newTrip.price,
        bus_id: newTrip.busPlate,
        departureTime: newTrip.departureTime,
        arrivalTime: newTrip.arrivalTime,
        duration: calculateDuration(newTrip.departureTime, newTrip.arrivalTime),
      });
      const data = await getTrips();
      const mapped = data.map((trip: any) => {
        const bus = buses.find((b) => b._id === trip.bus_id);
        return {
          ...trip,
          origin: trip.from,
          destination: trip.to,
          departureDate: trip.date ? trip.date.slice(0, 10) : "",
          departureTime: trip.departureTime || "",
          arrivalTime: trip.arrivalTime || "",
          duration:
            trip.duration ||
            (trip.departureTime && trip.arrivalTime
              ? calculateDuration(trip.departureTime, trip.arrivalTime)
              : ""),
          busPlate: bus ? bus.plate : "",
          totalSeats: bus ? bus.seat_count : 0,
          availableSeats: bus ? bus.seat_count : 0,
          busType: bus ? bus.type : "",
        };
      });
      setTrips(mapped);
      setShowAddForm(false);
      setEditingTrip(null);
      setNewTrip({
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        busPlate: "",
        price: 0,
      });
    } catch (err: any) {
      alert(
        errorMessageTR(err?.response?.data?.error) || "Sefer güncellenemedi!"
      );
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm("Bu seferi silmek istediğinizden emin misiniz?")) {
      try {
        await deleteTripApi(tripId);
        setTrips(trips.filter((t) => t._id !== tripId));
      } catch (err) {
        alert("Sefer silinemedi!");
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTrip(null);
    setNewTrip({
      origin: "",
      destination: "",
      departureDate: "",
      departureTime: "",
      arrivalTime: "",
      busPlate: "",
      price: 0,
    });
  };

  // Tarih ve saat için min değerler
  const todayStr = new Date().toISOString().slice(0, 10);
  // Saat için yardımcı fonksiyon
  const getMinDepartureTime = () => {
    if (newTrip.departureDate === todayStr) {
      const now = new Date();
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };
  const getMinArrivalTime = () => {
    if (!newTrip.departureTime) return "00:00";
    // Eğer kalkış ve varış aynı gün olacaksa min kalkış saati, ertesi gün olacaksa min 00:00
    // Kullanıcıya her zaman 00:00'dan itibaren seçim hakkı ver, backend zaten kontrol ediyor
    return "00:00";
  };

  const handleTripSelect = (trip: any) => {
    navigate(`/admin/trips/${trip._id}`);
  };
  const handleCloseTripDetail = () => {
    setShowTripDetail(false);
    setSelectedTrip(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sefer Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Otobüs seferlerini ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Sefer</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div
          ref={formRef}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingTrip ? "Sefer Düzenle" : "Yeni Sefer Ekle"}
          </h2>

          <form
            onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kalkış Şehri
                </label>
                <select
                  value={newTrip.origin}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, origin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((city: any) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varış Şehri
                </label>
                <select
                  value={newTrip.destination}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, destination: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities
                    .filter((city: any) => city !== newTrip.origin)
                    .map((city: any) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kalkış Tarihi
                </label>
                <input
                  type="date"
                  value={newTrip.departureDate}
                  min={todayStr}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, departureDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Otobüs
                </label>
                <select
                  value={newTrip.busPlate}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, busPlate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Otobüs seçin</option>
                  {buses.map((bus: any) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kalkış Saati
                </label>
                <input
                  type="time"
                  value={newTrip.departureTime}
                  min={getMinDepartureTime()}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, departureTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varış Saati
                </label>
                <input
                  type="time"
                  value={newTrip.arrivalTime}
                  min={getMinArrivalTime()}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, arrivalTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  value={newTrip.price}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingTrip ? "Güncelle" : "Ekle"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sefer ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.origin}
              onChange={(e) =>
                setFilters({ ...filters, origin: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm kalkış noktaları</option>
              {cities.map((city: any) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.destination}
              onChange={(e) =>
                setFilters({ ...filters, destination: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm varış noktaları</option>
              {cities.map((city: any) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Seferler ({filteredTrips.length})
          </h2>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sefer bulunamadı
            </h3>
            <p className="text-gray-600">
              Arama kriterlerinizi değiştirin veya yeni sefer ekleyin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between"
              >
                <div className="flex-1">
                  <TripCard
                    trip={trip}
                    onSelect={handleTripSelect}
                    showSelectButton={false}
                  />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip._id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTripDetail && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
            <button
              onClick={handleCloseTripDetail}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Sefer Detayı</h2>
            <div className="mb-2">
              Otobüs: <b>{selectedTrip.busPlate}</b>
            </div>
            <div className="mb-2">
              Kalkış: <b>{selectedTrip.origin}</b> ({selectedTrip.departureTime}
              )
            </div>
            <div className="mb-2">
              Varış: <b>{selectedTrip.destination}</b> (
              {selectedTrip.arrivalTime})
            </div>
            <div className="mb-2">
              Tarih: <b>{selectedTrip.departureDate}</b>
            </div>
            <div className="mb-2">
              Fiyat: <b>₺{selectedTrip.price}</b>
            </div>
            {/* Koltuk haritası ve diğer detaylar buraya eklenecek */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
