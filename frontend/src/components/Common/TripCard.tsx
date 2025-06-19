import React from 'react';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
  showSelectButton?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect, showSelectButton = true }) => {
  const getAvailabilityColor = () => {
    const percentage = (trip.availableSeats / trip.totalSeats) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityBg = () => {
    const percentage = (trip.availableSeats / trip.totalSeats) * 100;
    if (percentage > 50) return 'bg-green-50 border-green-200';
    if (percentage > 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Trip Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{trip.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900">{trip.destination}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${trip.busType === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {trip.busType}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{trip.departureTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{trip.availableSeats} / {trip.totalSeats} koltuk</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Plaka:</span>
              <span className="font-medium">{trip.busPlate}</span>
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end mt-4 lg:mt-0">
          <div className={`px-3 py-2 rounded-lg border ${getAvailabilityBg()}`}>
            <span className={`text-sm font-medium ${getAvailabilityColor()}`}>
              {trip.availableSeats > 0 ? `${trip.availableSeats} koltuk` : 'Dolu'}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">₺{trip.price}</div>
            {showSelectButton && (
              <button
                onClick={() => onSelect(trip)}
                disabled={trip.availableSeats === 0}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {trip.availableSeats > 0 ? 'Koltuk Seç' : 'Dolu'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;