import React from "react";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Edit2,
  Trash2,
} from "lucide-react";
import { Trip } from "../../pages/admin/AdminTrips";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
  showSelectButton?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelect,
  showSelectButton = true,
}) => {
  const getAvailabilityColor = () => {
    const percentage =
      ((trip.availableSeats ?? 0) / (trip.totalSeats ?? 0)) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityBg = () => {
    const percentage =
      ((trip.availableSeats ?? 0) / (trip.totalSeats ?? 0)) * 100;
    if (percentage > 50) return "bg-green-50 border-green-200";
    if (percentage > 20) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative cursor-pointer`}
      onClick={() => onSelect(trip)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Trip Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{trip.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900">
                {trip.destination}
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-lg border ml-4 text-sm font-medium ${
                trip.status === "cancelled"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
              style={{ minWidth: "60px", textAlign: "center" }}
            >
              {trip.status === "cancelled" ? "İptal" : "Aktif"}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Kalkış:</span>
              <span>{trip.departureTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="font-medium">Varış:</span>
              <span>{trip.arrivalTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {typeof trip.availableSeats === "number" &&
                typeof trip.totalSeats === "number"
                  ? `${trip.availableSeats} boş koltuk`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Plaka:</span>
              <span className="font-medium">{trip.busPlate}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-700">
            {trip.departureDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(trip.departureDate), "d MMMM yyyy", {
                    locale: tr,
                  })}
                </span>
              </div>
            )}
            {trip.busType && <span className="mx-2">|</span>}
            {trip.busType && (
              <div className="flex items-center space-x-1">
                <span>{trip.busType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end mt-4 lg:mt-0">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ₺{trip.price}
            </div>
            {showSelectButton && (
              <button
                onClick={() => onSelect(trip)}
                disabled={(trip.availableSeats ?? 0) === 0}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {(trip.availableSeats ?? 0) > 0 ? "Koltuk Seç" : "Dolu"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
