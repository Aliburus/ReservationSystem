import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Filter, Calendar } from "lucide-react";
// import { mockBuses, cities } from "../../data/mockData";
import TripCard from "../../components/Common/TripCard";
import Spinner from "../../components/Common/Spinner";
import {
  getTrips,
  createTrip,
  deleteTrip as deleteTripApi,
  updateTrip,
  bulkUpdateTripPrices,
} from "../../services/tripService";
import { getBuses } from "../../services/busService";
import SeatMap from "../../components/Common/SeatMap";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  updateReservation,
} from "../../services/reservationService";

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
  trip_id?: string;
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
    status: "Aktif",
    plate: "",
    trip_id: "",
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

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [bulkRepeat, setBulkRepeat] = useState("daily");

  const [formError, setFormError] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceType, setBulkPriceType] = useState("percent");
  const [bulkPriceValue, setBulkPriceValue] = useState(0);
  const [bulkPriceStart, setBulkPriceStart] = useState("");
  const [bulkPriceEnd, setBulkPriceEnd] = useState("");
  const [bulkPriceResult, setBulkPriceResult] = useState("");

  const [bulkPriceFrom, setBulkPriceFrom] = useState("");
  const [bulkPriceTo, setBulkPriceTo] = useState("");

  const [bulkAllTrips, setBulkAllTrips] = useState(false);
  const [bulkDateRange, setBulkDateRange] = useState(false);
  const [bulkRoute, setBulkRoute] = useState(false);

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

  const getTripStatus = (trip: any) => {
    let dateStr = trip.departureDate || trip.date;
    let tripDate: Date | null = null;
    if (dateStr) {
      if (typeof dateStr === "string" && dateStr.length > 10) {
        dateStr = dateStr.slice(0, 10);
      }
      tripDate = new Date(dateStr);
    }
    if (trip.status === "cancelled") return "İptal";
    if (tripDate && !isNaN(tripDate.getTime())) {
      // Seferin günü tamamen geçmeden 'Geçti' olmasın
      const tripEndOfDay = new Date(tripDate);
      tripEndOfDay.setHours(23, 59, 59, 999);
      if (tripEndOfDay < new Date()) return "Geçti";
    }
    return "Aktif";
  };

  const filteredTrips = trips.filter((trip) => {
    // Status filtresi en başta kontrol edilsin ve eşleşme kesin olsun
    if (filters.status) {
      const tripStatus = (getTripStatus(trip) || "").toLowerCase().trim();
      const filterStatus = (filters.status || "").toLowerCase().trim();

      if (tripStatus !== filterStatus) {
        return false;
      }
    }
    const matchesSearch =
      (trip.origin || trip.from || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.destination || trip.to || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (trip.busPlate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (filters.plate &&
        (trip.busPlate || "")
          .toLowerCase()
          .includes(filters.plate.toLowerCase())) ||
      (filters.trip_id &&
        (trip.trip_id || "")
          .toLowerCase()
          .includes(filters.trip_id.toLowerCase()));

    const matchesFilters =
      (!filters.origin || (trip.origin || trip.from) === filters.origin) &&
      (!filters.destination ||
        (trip.destination || trip.to) === filters.destination) &&
      (!filters.date || (trip.departureDate || trip.date) === filters.date) &&
      (!filters.busType || trip.busType === filters.busType) &&
      (!filters.trip_id ||
        (trip.trip_id || "")
          .toLowerCase()
          .includes(filters.trip_id.toLowerCase()));

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

  const validateTripTimes = (
    departureDate: string,
    departureTime: string,
    arrivalTime: string
  ) => {
    if (!departureDate || !departureTime || !arrivalTime) return true;
    const dep = new Date(`${departureDate}T${departureTime}`);
    let arr = new Date(`${departureDate}T${arrivalTime}`);
    // Eğer varış saati kalkış saatinden küçükse, ertesi gün varış kabul et
    if (arrivalTime < departureTime) {
      arr.setDate(arr.getDate() + 1);
    }
    return arr > dep;
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (
      !validateTripTimes(
        newTrip.departureDate,
        newTrip.departureTime,
        newTrip.arrivalTime
      )
    ) {
      setFormError("Varış saati, kalkış saatinden sonra olmalı.");
      return;
    }
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
        trip_id: generateTripId(),
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
      window.location.reload();
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
      window.location.reload();
    } catch (err: any) {
      alert(
        errorMessageTR(err?.response?.data?.error) || "Sefer güncellenemedi!"
      );
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm("Bu seferi silmek istediğinizden emin misiniz?")) {
      try {
        // Önce rezervasyonları iptal et
        const reservations = await getReservations({ trip_id: tripId });
        for (const r of reservations) {
          if (r.status === "active") {
            await updateReservation(r._id, { status: "cancelled" });
          }
        }
        // Sonra seferi sil
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

  // Sıralama: önce aktif, sonra geçmiş seferler
  const now = new Date();
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const aDate = new Date(a.departureDate || a.date);
    const bDate = new Date(b.departureDate || b.date);
    return aDate.getTime() - bDate.getTime(); // En eski en üstte
  });

  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 20;
  const totalPages = Math.ceil(sortedTrips.length / tripsPerPage);
  const paginatedTrips = sortedTrips.slice(
    (currentPage - 1) * tripsPerPage,
    currentPage * tripsPerPage
  );

  // TripCard'a doluluk oranı prop'u ekle
  const getOccupancy = (trip: any) => {
    if (typeof trip.totalSeats !== "number" || trip.totalSeats === 0) return 0;
    const sold = trip.totalSeats - (trip.availableSeats ?? 0);
    return Math.round((sold / trip.totalSeats) * 100);
  };

  const generateTripId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 12; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // Yardımcı fonksiyon: güvenli şekilde gün ekle
  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const handleBulkAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setBulkError("");
    setBulkSuccess("");
    setBulkLoading(true);
    if (
      !validateTripTimes(
        newTrip.departureDate,
        newTrip.departureTime,
        newTrip.arrivalTime
      )
    ) {
      setFormError("Varış saati, kalkış saatinden sonra olmalı.");
      setBulkLoading(false);
      return;
    }
    if (!newTrip.departureDate || !bulkEndDate) {
      setBulkLoading(false);
      return;
    }
    const start = new Date(newTrip.departureDate);
    const end = new Date(bulkEndDate);
    const tripsToCreate = [];
    let current = new Date(start);
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (current.getTime() <= end.getTime()) {
      // Ana sefer (gidiş)
      tripsToCreate.push({
        ...newTrip,
        departureDate: current.toISOString().slice(0, 10),
        trip_id: generateTripId(),
      });
      // Haftalık planlama için dönüş seferi (3 gün sonra)
      if (bulkRepeat === "weekly") {
        const returnDate = new Date(current.getTime());
        returnDate.setDate(returnDate.getDate() + 3);
        returnDate.setHours(0, 0, 0, 0);
        if (returnDate.getTime() <= end.getTime()) {
          tripsToCreate.push({
            ...newTrip,
            origin: newTrip.destination,
            destination: newTrip.origin,
            departureDate: returnDate.toISOString().slice(0, 10),
            trip_id: generateTripId(),
          });
        }
      }
      // current'ı haftalık olarak ilerlet
      current = new Date(current.getTime());
      current.setDate(current.getDate() + 7);
      current.setHours(0, 0, 0, 0);
    }
    const failedDates: string[] = [];
    const successDates: string[] = [];
    for (const trip of tripsToCreate) {
      try {
        await createTrip({
          from: trip.origin,
          to: trip.destination,
          date: trip.departureDate,
          price: trip.price,
          bus_id: trip.busPlate,
          departureTime: trip.departureTime,
          arrivalTime: trip.arrivalTime,
          duration: calculateDuration(trip.departureTime, trip.arrivalTime),
          trip_id: trip.trip_id,
        });
        successDates.push(
          `${trip.departureDate} (${trip.origin} → ${trip.destination})`
        );
      } catch (err: any) {
        failedDates.push(
          `${trip.departureDate} (${trip.origin} → ${trip.destination})`
        );
      }
    }
    if (failedDates.length > 0) {
      setBulkError(`Bazı seferler eklenemedi: ${failedDates.join(", ")}`);
    }
    if (successDates.length > 0) {
      setBulkSuccess(`Başarıyla eklenen seferler: ${successDates.join(", ")}`);
    }
    if (failedDates.length === 0) {
      setShowAddForm(false);
      setIsBulkMode(false);
      setBulkEndDate("");
      setBulkRepeat("daily");
      setNewTrip({
        origin: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        arrivalTime: "",
        busPlate: "",
        price: 0,
      });
      window.location.reload();
    }
    fetchTrips();
    setBulkLoading(false);
  };

  const handleBulkPriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkPriceResult("");
    if (!bulkAllTrips && !bulkDateRange && !bulkRoute) {
      setBulkPriceResult("Lütfen en az bir kriter seçin.");
      return;
    }
    if (bulkDateRange && (!bulkPriceStart || !bulkPriceEnd)) {
      setBulkPriceResult("Lütfen tarih aralığı seçin.");
      return;
    }
    try {
      const req: any = {
        type: bulkPriceType,
        value: bulkPriceValue,
      };
      if (bulkAllTrips) req.all = true;
      if (bulkDateRange) {
        req.startDate = bulkPriceStart;
        req.endDate = bulkPriceEnd;
      }
      if (bulkRoute) {
        if (bulkPriceFrom) req.from = bulkPriceFrom;
        if (bulkPriceTo) req.to = bulkPriceTo;
      }
      const res = await bulkUpdateTripPrices(req);
      setBulkPriceResult(res.message || "Fiyatlar başarıyla güncellendi.");
      fetchTrips();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg?.includes("kriterlere uygun güncellenecek sefer bulunamadı")) {
        setBulkPriceResult(
          "Seçilen kriterlere uygun güncellenecek sefer bulunamadı."
        );
      } else if (msg?.includes("tarih aralığı")) {
        setBulkPriceResult("Lütfen geçerli bir tarih aralığı girin.");
      } else if (msg?.includes("Güncelleme türü ve değer zorunlu")) {
        setBulkPriceResult("Güncelleme türü ve değer alanı zorunludur.");
      } else {
        setBulkPriceResult("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  if (loading) return <Spinner />;

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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setIsBulkMode(false);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Sefer</span>
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              setIsBulkMode(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Toplu Sefer Ekle</span>
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            onClick={() => setShowBulkPriceModal(true)}
          >
            <span>Toplu Fiyat Güncelle</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div
          ref={formRef}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingTrip
              ? "Sefer Düzenle"
              : isBulkMode
              ? "Toplu Sefer Ekle"
              : "Yeni Sefer Ekle"}
          </h2>

          {formError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm font-semibold">
              {formError}
            </div>
          )}

          {bulkError && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 text-sm font-semibold">
              {bulkError}
            </div>
          )}

          {bulkSuccess && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-sm font-semibold">
              {bulkSuccess}
            </div>
          )}

          <form
            onSubmit={
              isBulkMode
                ? handleBulkAddTrip
                : editingTrip
                ? handleUpdateTrip
                : handleAddTrip
            }
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
                      {bus.plate} - {bus.type}
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

              {isBulkMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={bulkEndDate}
                      min={newTrip.departureDate || todayStr}
                      onChange={(e) => setBulkEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tekrar Sıklığı
                    </label>
                    <select
                      value={bulkRepeat}
                      onChange={(e) => setBulkRepeat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="daily">Her Gün</option>
                      <option value="weekly">Her Hafta</option>
                      <option value="monthly">Her Ay</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={bulkLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading
                  ? "Oluşturuluyor..."
                  : editingTrip
                  ? "Güncelle"
                  : isBulkMode
                  ? "Oluştur"
                  : "Ekle"}
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm mb-6 items-end">
          {/* Kalkış noktası */}
          <select
            value={filters.origin}
            onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm kalkış noktaları</option>
            {cities.map((city: any) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {/* Varış noktası */}
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
          {/* Tarih */}
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Durum */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm durumlar</option>
            <option value="Aktif">Aktif</option>
            <option value="Geçti">Geçti</option>
            <option value="İptal">İptal</option>
          </select>
          {/* Plaka ve Seyahat No yan yana */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Plaka ile ara"
              value={filters.plate}
              onChange={(e) =>
                setFilters({ ...filters, plate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Seyahat No ile ara"
              value={filters.trip_id}
              onChange={(e) =>
                setFilters({ ...filters, trip_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Filtreleri Temizle butonu */}
          <button
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold border border-gray-300"
            onClick={() =>
              setFilters({
                origin: "",
                destination: "",
                date: "",
                busType: "",
                status: "Aktif",
                plate: "",
                trip_id: "",
              })
            }
            type="button"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Seferler ({sortedTrips.length})
          </h2>
        </div>

        {sortedTrips.length === 0 ? (
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
          <>
            <div className="space-y-4">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <TripCard
                      trip={{ ...trip, status: getTripStatus(trip) }}
                      onSelect={handleTripSelect}
                      showSelectButton={false}
                      occupancy={getOccupancy(trip)}
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
                  {getTripStatus(trip) === "Geçti" && (
                    <button
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => {
                        setShowAddForm(true);
                        setNewTrip({
                          origin: trip.origin || trip.from || "",
                          destination: trip.destination || trip.to || "",
                          departureDate: "",
                          departureTime: trip.departureTime || "",
                          arrivalTime: trip.arrivalTime || "",
                          busPlate: trip.busPlate || trip.bus_id || "",
                          price: trip.price,
                        });
                      }}
                    >
                      Tekrarla
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded border text-sm font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
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

      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative border">
            <button
              onClick={() => setShowBulkPriceModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6">Toplu Fiyat Güncelle</h2>
            <form
              onSubmit={handleBulkPriceUpdate}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-wrap gap-6 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkAllTrips}
                    onChange={(e) => setBulkAllTrips(e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-bold text-base">Tüm Seferler</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkDateRange}
                    onChange={(e) => setBulkDateRange(e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-bold text-base">Tarih Aralığı</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkRoute}
                    onChange={(e) => setBulkRoute(e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-bold text-base">Rota</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={bulkPriceStart}
                    onChange={(e) => setBulkPriceStart(e.target.value)}
                    className={`border rounded px-2 py-2 w-full ${
                      !bulkDateRange
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    required={bulkDateRange}
                    disabled={!bulkDateRange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={bulkPriceEnd}
                    onChange={(e) => setBulkPriceEnd(e.target.value)}
                    className={`border rounded px-2 py-2 w-full ${
                      !bulkDateRange
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    required={bulkDateRange}
                    disabled={!bulkDateRange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Kalkış Şehri
                  </label>
                  <select
                    value={bulkPriceFrom}
                    onChange={(e) => setBulkPriceFrom(e.target.value)}
                    className={`border rounded px-2 py-2 w-full ${
                      !bulkRoute
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!bulkRoute}
                  >
                    <option value="">Tümü</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Varış Şehri
                  </label>
                  <select
                    value={bulkPriceTo}
                    onChange={(e) => setBulkPriceTo(e.target.value)}
                    className={`border rounded px-2 py-2 w-full ${
                      !bulkRoute
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={!bulkRoute}
                  >
                    <option value="">Tümü</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Güncelleme Türü
                  </label>
                  <select
                    value={bulkPriceType}
                    onChange={(e) => setBulkPriceType(e.target.value)}
                    className="border rounded px-2 py-2 w-full"
                  >
                    <option value="percent">Yüzde Artış (%)</option>
                    <option value="add">Sabit Artış (TL)</option>
                    <option value="set">Sabit Fiyat (TL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Değer
                  </label>
                  <input
                    type="number"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(Number(e.target.value))}
                    className="border rounded px-2 py-2 w-full"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white text-lg font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 mt-2"
              >
                Güncelle
              </button>
              {bulkPriceResult && (
                <div className="mt-2 text-center text-sm text-red-600">
                  {bulkPriceResult}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
