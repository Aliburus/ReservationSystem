import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeatMap from "../components/Common/SeatMap";
import { getTrips, createReservation } from "../services/tripService";
import { getBuses } from "../services/busService";
import { getReservations } from "../services/reservationService";

const TripDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      seat_number: number;
      first_name: string;
      last_name: string;
      phone: string;
    }[]
  >([]);
  const [viewReservation, setViewReservation] = useState<{
    seat_number: number;
    first_name: string;
    last_name: string;
    phone: string;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);

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
        console.log("getReservations data:", data);
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
        console.log("Occupied seats:", occupiedSeatsData);
        setOccupiedSeats(occupiedSeatsData);
      }
    };
    fetchReservations();
  }, [id]);

  // Debug için occupiedSeats değişikliklerini izle
  useEffect(() => {
    console.log("SeatMap occupiedSeats:", occupiedSeats);
  }, [occupiedSeats]);

  // SeatMap için layout oluştur
  const layout = bus
    ? {
        seatsPerRow: bus.seatsPerRow || 4,
        rows: bus.rows || Math.ceil(bus.seat_count / (bus.seatsPerRow || 4)),
        columns: bus.columns || bus.seatsPerRow || 4,
        aisleAfter: bus.aisleAfter || [2],
        unavailableSeats: bus.unavailableSeats || [],
      }
    : null;

  const handleSeatSelect = (seatNumber: number) => {
    const res = reservations.find((r) => r.seat_number === seatNumber);
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
        await createReservation({
          trip_id: trip._id,
          seat_number: selectedSeat,
          first_name: reserveForm.first_name,
          last_name: reserveForm.last_name,
          phone: reserveForm.phone,
        });
        setOccupiedSeats([...occupiedSeats, selectedSeat]);
        setReservations([
          ...reservations,
          { seat_number: selectedSeat, ...reserveForm },
        ]);
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
  const handleReservationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewReservation) {
      setReservations(
        reservations.map((r) =>
          r.seat_number === viewReservation.seat_number
            ? { seat_number: r.seat_number, ...reserveForm }
            : r
        )
      );
      setViewReservation({
        seat_number: viewReservation.seat_number,
        ...reserveForm,
      });
      setEditMode(false);
    }
  };
  const handleReservationModalClose = () => {
    setViewReservation(null);
    setEditMode(false);
    setReserveForm({ first_name: "", last_name: "", phone: "" });
  };

  const totalSeats = bus?.seat_count || 0;
  const emptySeats = totalSeats - occupiedSeats.length;

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (!trip || !bus)
    return <div className="p-8">Sefer veya otobüs bulunamadı.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="rounded-xl shadow-lg bg-white p-8 mb-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
          Sefer Detayı
        </h1>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="text-lg">
              Otobüs Plakası: <b className="font-semibold">{bus.plate}</b>
            </div>
            <div className="text-lg">
              Otobüs Tipi: <b className="font-semibold">{bus.type}</b>
            </div>
            <div className="text-lg">
              Toplam Koltuk: <b className="font-semibold">{bus.seat_count}</b>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg">
              Kalkış: <b className="font-semibold">{trip.from}</b>{" "}
              <span className="text-gray-500">({trip.departureTime})</span>
            </div>
            <div className="text-lg">
              Varış: <b className="font-semibold">{trip.to}</b>{" "}
              <span className="text-gray-500">({trip.arrivalTime})</span>
            </div>
            <div className="text-lg">
              Tarih: <b className="font-semibold">{trip.date?.slice(0, 10)}</b>
            </div>
            <div className="text-lg">
              Fiyat:{" "}
              <b className="font-semibold text-green-600">₺{trip.price}</b>
            </div>
            <div className="text-lg flex items-center gap-2">
              <span className="inline-flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5m6 0v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2m6 0H6"
                  ></path>
                </svg>
                {emptySeats} boş koltuk
              </span>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">Koltuklar</h2>
      <div className="rounded-xl shadow-lg bg-white p-6 border border-gray-200">
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
                  onClick={handleReservationEdit}
                  className="mt-4 w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                >
                  Düzenle
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
