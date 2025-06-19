import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, User, Phone, Mail } from "lucide-react";
import { getTrips } from "../services/tripService";
import { createReservation } from "../services/reservationService";
import { getBuses } from "../services/busService";
import { getReservations } from "../services/reservationService";
import { Trip, Bus, Reservation } from "../types";
import { useAuth } from "../contexts/AuthContext";
import TripCard from "../components/Common/TripCard";
import SeatMap from "../components/Common/SeatMap";

const BookingPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [step, setStep] = useState<"seats" | "passenger" | "payment">("seats");
  const [passengerInfo, setPassengerInfo] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
  });
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const trips = await getTrips();
        const found = trips.find((t) => t.id === tripId);
        setTrip(found || null);
        if (found) {
          const buses = await getBuses();
          const foundBus = buses.find((b) => b.plate === found.busPlate);
          setBus(foundBus || null);
        }
        const res = await getReservations({ tripId });
        setReservations(res);
      } catch (e) {}
      setLoading(false);
    };
    fetchTrip();
  }, [tripId]);

  const getOccupiedSeats = () => {
    if (!trip) return [];
    return reservations
      .filter((r) => r.tripId === trip.id && r.status === "confirmed")
      .flatMap((r) => r.seatNumbers);
  };

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleNextStep = () => {
    if (step === "seats" && selectedSeats.length > 0) {
      setStep("passenger");
    } else if (step === "passenger") {
      setStep("payment");
    }
  };

  const handlePreviousStep = () => {
    if (step === "payment") {
      setStep("passenger");
    } else if (step === "passenger") {
      setStep("seats");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !user) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newReservation: Reservation = {
      id: `res_${Date.now()}`,
      userId: user.id,
      tripId: trip.id,
      seatNumbers: selectedSeats,
      passengerName: passengerInfo.name,
      passengerPhone: passengerInfo.phone,
      totalPrice: selectedSeats.length * trip.price,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
      paymentMethod: "Credit Card",
    };

    await createReservation({
      tripId: trip.id,
      seatNumbers: selectedSeats,
      passengerName: passengerInfo.name,
      passengerPhone: passengerInfo.phone,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
      paymentMethod: "cash",
      totalPrice: trip.price * selectedSeats.length,
    });
    setProcessing(false);

    navigate("/dashboard", {
      state: {
        message: "Rezervasyonunuz başarıyla tamamlandı!",
        reservationId: newReservation.id,
      },
    });
  };

  const handleBooking = async () => {
    if (!trip) return;
    try {
      await createReservation({
        tripId: trip.id,
        seatNumbers: selectedSeats,
        passengerName: passengerInfo.name,
        passengerPhone: passengerInfo.phone,
        status: "confirmed",
        bookingDate: new Date().toISOString(),
        paymentMethod: "cash",
        totalPrice: trip.price * selectedSeats.length,
      });
      setMessage("Rezervasyon başarılı!");
    } catch (e) {
      setMessage("Rezervasyon başarısız!");
    }
  };

  if (!trip || !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Sefer bulunamadı...</p>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSeats.length * trip.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Geri Dön</span>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div
            className={`flex items-center space-x-2 ${
              step === "seats"
                ? "text-blue-600"
                : selectedSeats.length > 0
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "seats"
                  ? "bg-blue-600 text-white"
                  : selectedSeats.length > 0
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="font-medium">Koltuk Seçimi</span>
          </div>

          <div
            className={`flex items-center space-x-2 ${
              step === "passenger"
                ? "text-blue-600"
                : step === "payment"
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "passenger"
                  ? "bg-blue-600 text-white"
                  : step === "payment"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="font-medium">Yolcu Bilgileri</span>
          </div>

          <div
            className={`flex items-center space-x-2 ${
              step === "payment" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "payment" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <span className="font-medium">Ödeme</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === "seats" && (
            <SeatMap
              layout={bus.seatLayout}
              occupiedSeats={getOccupiedSeats()}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
          )}

          {step === "passenger" && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Yolcu Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={passengerInfo.name}
                      onChange={(e) =>
                        setPassengerInfo({
                          ...passengerInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adınız ve soyadınız"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={passengerInfo.phone}
                      onChange={(e) =>
                        setPassengerInfo({
                          ...passengerInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+90 555 123 4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={passengerInfo.email}
                      onChange={(e) =>
                        setPassengerInfo({
                          ...passengerInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Ödeme Bilgileri
              </h3>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Numarası
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) =>
                        setPaymentInfo({
                          ...paymentInfo,
                          cardNumber: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) =>
                        setPaymentInfo({
                          ...paymentInfo,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, cvv: e.target.value })
                      }
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Sahibinin Adı
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.holderName}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        holderName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kart üzerindeki isim"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "İşleniyor..." : `₺${totalPrice} Öde`}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                Bu bir demo uygulamadır. Gerçek ödeme işlemi yapılmayacaktır.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trip Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sefer Özeti
            </h3>
            <TripCard
              trip={trip}
              onSelect={() => {}}
              showSelectButton={false}
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rezervasyon Özeti
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Seçilen Koltuklar:</span>
                <span className="font-medium">
                  {selectedSeats.length > 0
                    ? selectedSeats.join(", ")
                    : "Seçilmedi"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Koltuk Sayısı:</span>
                <span className="font-medium">{selectedSeats.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Koltuk Başına Fiyat:</span>
                <span className="font-medium">₺{trip.price}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span>₺{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {step !== "seats" && (
                <button
                  onClick={handlePreviousStep}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Geri
                </button>
              )}

              {step !== "payment" && (
                <button
                  onClick={handleNextStep}
                  disabled={step === "seats" && selectedSeats.length === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {step === "seats" ? "Devam Et" : "Ödemeye Geç"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
