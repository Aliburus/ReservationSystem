import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SeatMap from "../components/Common/SeatMap";
import Spinner from "../components/Common/Spinner";
import {
  getTrips,
  createReservation,
  updateTripDrivers,
} from "../services/tripService";
import { getBuses } from "../services/busService";
import {
  getReservations,
  updateReservation,
} from "../services/reservationService";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { getDrivers, getAvailableDrivers } from "../services/driverService";
import { User, Users } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const TripDetailPage: React.FC = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [reservations, setReservations] = useState<
    {
      _id: string;
      seat_number: number;
      first_name: string;
      last_name: string;
      phone: string;
      status?: string;
    }[]
  >([]);
  const [viewReservation, setViewReservation] = useState<{
    _id: string;
    seat_number: number;
    first_name: string;
    last_name: string;
    phone: string;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const trips = await getTrips();
      const t = trips.find((tr: any) => String(tr._id) === String(id));
      setTrip(t);
      if (t) {
        const buses = await getBuses();
        const b = buses.find((bus: any) => bus._id === t.bus_id);
        setBus(b);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (id) {
        const data: any = await getReservations({ trip_id: id });
        let reservationsArr: any[] = [];
        if (Array.isArray(data)) {
          reservationsArr = data;
        } else if (data && Array.isArray(data.reservations)) {
          reservationsArr = data.reservations;
        }
        setReservations(reservationsArr);
        const occupiedSeatsData = reservationsArr.map(
          (r: any) => r.seat_number
        );
        setOccupiedSeats(occupiedSeatsData);
      }
    };
    fetchReservations();
  }, [id]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const data = await getDrivers();
      setDrivers(data);
    };
    fetchDrivers();
  }, []);

  // SeatMap için layout oluştur
  const layout = bus
    ? bus.type === "2+1"
      ? {
          seatsPerRow: 3,
          rows: Math.ceil(bus.seat_count / 3),
          columns: 3,
          aisleAfter: [1],
          unavailableSeats: bus.unavailableSeats || [],
        }
      : {
          seatsPerRow: 4,
          rows: Math.ceil(bus.seat_count / 4),
          columns: 4,
          aisleAfter: [2],
          unavailableSeats: bus.unavailableSeats || [],
        }
    : null;

  // Trip status hesaplama fonksiyonu
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
      const tripEndOfDay = new Date(tripDate);
      tripEndOfDay.setHours(23, 59, 59, 999);
      if (tripEndOfDay < new Date()) return "Geçti";
    }
    return "Aktif";
  };

  const handleSeatSelect = (seatNumber: number) => {
    const res = reservations.find((r) => r.seat_number === seatNumber);
    const tripStatus = trip ? getTripStatus(trip) : "";
    if (tripStatus === "Geçti" || tripStatus === "İptal") {
      if (res) {
        setViewReservation(res);
        setEditMode(false);
      }
      return;
    }
    if (res) {
      setViewReservation(res);
      setEditMode(false);
    } else {
      setSelectedSeat(seatNumber);
      setShowReserveModal(true);
    }
  };
  const handleReserveModalClose = () => {
    setShowReserveModal(false);
    setSelectedSeat(null);
    setReserveForm({ first_name: "", last_name: "", phone: "" });
  };
  const handleReserveFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReserveForm({ ...reserveForm, [e.target.name]: e.target.value });
  };
  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeat && trip) {
      try {
        const created = await createReservation({
          trip_id: trip._id,
          seat_number: selectedSeat,
          first_name: reserveForm.first_name,
          last_name: reserveForm.last_name,
          phone: reserveForm.phone,
        });
        setOccupiedSeats([...occupiedSeats, selectedSeat]);
        setReservations([...reservations, created]);
        setShowReserveModal(false);
        setSelectedSeat(null);
        setReserveForm({ first_name: "", last_name: "", phone: "" });
      } catch (err: any) {
        alert(err?.response?.data?.error || "Rezervasyon yapılamadı!");
      }
    }
  };
  const handleReservationEdit = () => {
    setEditMode(true);
    setReserveForm({
      first_name: viewReservation?.first_name || "",
      last_name: viewReservation?.last_name || "",
      phone: viewReservation?.phone || "",
    });
  };
  const handleReservationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewReservation) {
      try {
        await updateReservation(viewReservation._id, reserveForm);
        setReservations(
          reservations.map((r) =>
            r.seat_number === viewReservation.seat_number
              ? { ...r, ...reserveForm }
              : r
          )
        );
        setViewReservation({
          ...viewReservation,
          ...reserveForm,
        });
        setEditMode(false);
      } catch (err: any) {
        alert(err?.response?.data?.error || "Rezervasyon güncellenemedi!");
      }
    }
  };
  const handleReservationModalClose = () => {
    setViewReservation(null);
    setEditMode(false);
    setReserveForm({ first_name: "", last_name: "", phone: "" });
  };
  const handleDownloadTicket = () => {
    if (!viewReservation || !trip) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a6",
    });
    // Arka plan kutusu
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(5, 10, 100, 80, 5, 5, "F");
    // Başlık
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 80);
    doc.text("Otobüs Bileti", 55, 22, { align: "center" });
    // Ayraç çizgi
    doc.setDrawColor(180, 180, 200);
    doc.line(10, 27, 105, 27);
    // Bilgiler
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 80);
    let y = 35;
    doc.text("Seyahat No:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(trip.trip_id), 45, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Kalkış:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(
      String((trip.from ?? "") + " (" + (trip.departureTime ?? "") + ")"),
      45,
      y
    );
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Varış:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(
      String((trip.to ?? "") + " (" + (trip.arrivalTime ?? "") + ")"),
      45,
      y
    );
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Tarih:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(trip.date && trip.date.slice(0, 10)), 45, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Koltuk No:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(viewReservation.seat_number), 45, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Ad Soyad:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(
      String(
        (viewReservation.first_name ?? "") +
          " " +
          (viewReservation.last_name ?? "")
      ),
      45,
      y
    );
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Telefon:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(viewReservation.phone), 45, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text("Fiyat:", 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(String("₺" + (trip.price ?? "")), 45, y);
    // Alt ayraç
    doc.setDrawColor(180, 180, 200);
    doc.line(10, y + 5, 105, y + 5);
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 140);
    doc.text("İyi yolculuklar dileriz!", 55, y + 13, { align: "center" });
    doc.save(`bilet_${trip.trip_id || ""}_${viewReservation.seat_number}.pdf`);
  };

  // Excel dosyası oluşturup direkt indir
  const handleDownloadExcel = () => {
    if (!bus || !trip) return;
    const wsData = [
      ["Koltuk No", "Ad", "Soyad", "Telefon"],
      ...Array.from({ length: bus.seat_count }, (_, i) => {
        const seatNo = i + 1;
        const res = reservations.find((r) => r.seat_number === seatNo);
        return [
          seatNo,
          res?.first_name || "",
          res?.last_name || "",
          res?.phone || "",
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rezervasyonlar");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(excelBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rezervasyon_listesi_${trip.trip_id}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalSeats = bus?.seat_count || 0;
  const emptySeats = totalSeats - occupiedSeats.length;

  const handleCancelReservation = async () => {
    if (!viewReservation || !trip) return;
    try {
      await updateReservation(viewReservation._id, { status: "cancelled" });
      // Rezervasyonları güncelle, sadece aktif olanlar occupiedSeats'a alınsın
      const updatedReservations = reservations.map((r) =>
        r._id === viewReservation._id ? { ...r, status: "cancelled" } : r
      );
      setReservations(updatedReservations);
      setOccupiedSeats(
        updatedReservations
          .filter((r) => r.status !== "cancelled")
          .map((r) => r.seat_number)
      );
      setViewReservation(null);
      setEditMode(false);
      setReserveForm({ first_name: "", last_name: "", phone: "" });
    } catch (err) {
      alert("Rezervasyon iptal edilemedi!");
    }
  };

  // Atanmış şoförleri belirle
  const assignedDriverIds =
    trip?.drivers && trip.drivers.length > 0
      ? trip.drivers.map((id: any) => String(id))
      : drivers
          .filter((d: any) => bus && String(d.assignedBus) === String(bus._id))
          .map((d: any) => String(d._id));
  const assignedDrivers = drivers.filter((d: any) =>
    assignedDriverIds.includes(String(d._id))
  );

  // Tarih ve saat formatlama fonksiyonu
  const getFormattedDateTime = () => {
    if (!trip?.date || !trip?.departureTime || !trip?.arrivalTime) return "";
    const dateObj = new Date(trip.date);
    const [depHour, depMin] = trip.departureTime.split(":").map(Number);
    const [arrHour, arrMin] = trip.arrivalTime.split(":").map(Number);
    let arrivalDateObj = new Date(dateObj);
    if (arrHour < depHour || (arrHour === depHour && arrMin < depMin)) {
      arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
    }
    return (
      format(dateObj, "d MMMM yyyy", { locale: tr }) +
      ", " +
      trip.departureTime +
      " - " +
      format(arrivalDateObj, "d MMMM yyyy", { locale: tr }) +
      " " +
      trip.arrivalTime
    );
  };

  if (loading) return <Spinner />;
  if (!trip || !bus)
    return <div className="p-8">Sefer veya otobüs bulunamadı.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="rounded-xl shadow bg-white p-6 sm:p-8 mb-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block bg-blue-100 text-blue-600 rounded-md p-2">
            <Users className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Sefer Detayı
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-gray-500">Otobüs Plakası</span>
              <span className="text-base font-semibold text-gray-800">
                {bus.plate}
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-gray-500">Otobüs Tipi</span>
              <span className="text-base font-semibold text-gray-800">
                {bus.type}
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-gray-500">Toplam Koltuk</span>
              <span className="text-base font-semibold text-gray-800">
                {bus.seat_count}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-gray-500">Kalkış</span>
              <span className="text-base font-semibold text-gray-800">
                {trip.from}{" "}
                <span className="text-gray-400 text-sm">
                  ({trip.departureTime})
                </span>
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-gray-500">Varış</span>
              <span className="text-base font-semibold text-gray-800">
                {trip.to}{" "}
                <span className="text-gray-400 text-sm">
                  ({trip.arrivalTime})
                </span>
              </span>
            </div>
            <div className="flex gap-3">
              <div className="bg-white border border-gray-100 rounded-lg p-3 flex-1 flex flex-col gap-1 shadow-sm">
                <span className="text-xs text-gray-500">Tarih & Saat</span>
                <span className="text-base font-semibold text-gray-800">
                  {getFormattedDateTime()}
                </span>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-3 flex-1 flex flex-col gap-1 shadow-sm">
                <span className="text-xs text-gray-500">Fiyat</span>
                <span className="text-lg font-bold text-green-700">
                  ₺{trip.price}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <User className="inline h-5 w-5 text-blue-400" />
          <span className="text-base font-medium text-gray-700">
            {emptySeats} boş koltuk
          </span>
        </div>
        {/* Atanmış Şoförler */}
        <div className="mt-8">
          <h3 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
            <Users className="inline h-4 w-4 text-blue-500" /> Atanmış Şoförler
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
            <ul className="mb-2">
              {assignedDrivers.length > 0 ? (
                assignedDrivers.map((driver) => (
                  <li
                    key={driver._id}
                    className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-100 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block bg-blue-200 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
                        {driver.name?.charAt(0) || "Ş"}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {driver.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {driver.phone}
                      </span>
                    </span>
                    <button
                      className="text-red-500 text-xs hover:underline px-2 py-1 rounded hover:bg-red-50"
                      onClick={async () => {
                        const newDrivers = assignedDriverIds.filter(
                          (id: any) => id !== String(driver._id)
                        );
                        await updateTripDrivers(trip._id, newDrivers);
                        setTrip({ ...trip, drivers: newDrivers });
                      }}
                    >
                      Çıkar
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">Şoför atanmadı</li>
              )}
            </ul>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold mt-2"
              onClick={() => setShowAssignModal(true)}
            >
              + Şoför Ekle
            </button>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">Koltuklar</h2>
      <div className="rounded-xl shadow-lg bg-white p-6 border border-gray-200">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Rezervasyon Listesini İndir
          </button>
        </div>
        {layout && (
          <SeatMap
            layout={layout}
            occupiedSeats={occupiedSeats}
            selectedSeats={selectedSeat ? [selectedSeat] : []}
            onSeatSelect={handleSeatSelect}
          />
        )}
      </div>
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              onClick={handleReserveModalClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Rezervasyon</h2>
            <form className="space-y-4" onSubmit={handleReserveSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Ad</label>
                <input
                  type="text"
                  name="first_name"
                  value={reserveForm.first_name}
                  onChange={handleReserveFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Soyad</label>
                <input
                  type="text"
                  name="last_name"
                  value={reserveForm.last_name}
                  onChange={handleReserveFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  name="phone"
                  value={reserveForm.phone}
                  onChange={handleReserveFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Rezervasyon Yap
              </button>
            </form>
          </div>
        </div>
      )}
      {viewReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              onClick={handleReservationModalClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Rezervasyon Bilgileri</h2>
            {!editMode ? (
              <>
                <div className="mb-2">
                  Koltuk No: <b>{viewReservation.seat_number}</b>
                </div>
                <div className="mb-2">
                  Ad: <b>{viewReservation.first_name}</b>
                </div>
                <div className="mb-2">
                  Soyad: <b>{viewReservation.last_name}</b>
                </div>
                <div className="mb-2">
                  Telefon: <b>{viewReservation.phone}</b>
                </div>
                <button
                  onClick={handleDownloadTicket}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Bileti İndir
                </button>
                <button
                  onClick={handleReservationEdit}
                  className="mt-4 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                >
                  Düzenle
                </button>
                <button
                  onClick={handleCancelReservation}
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Rezervasyonu İptal Et
                </button>
              </>
            ) : (
              <form className="space-y-4" onSubmit={handleReservationUpdate}>
                <div>
                  <label className="block text-sm font-medium mb-1">Ad</label>
                  <input
                    type="text"
                    name="first_name"
                    value={reserveForm.first_name}
                    onChange={handleReserveFormChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={reserveForm.last_name}
                    onChange={handleReserveFormChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={reserveForm.phone}
                    onChange={handleReserveFormChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailPage;
