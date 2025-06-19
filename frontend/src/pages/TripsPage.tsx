import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Filter, ArrowRight } from "lucide-react";
import { getTrips } from "../services/tripService";
import { Trip } from "../types";
import TripCard from "../components/Common/TripCard";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { mockTrips, cities } from "../data/mockData";

const TripsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    origin: searchParams.get("origin") || "",
    destination: searchParams.get("destination") || "",
    date: searchParams.get("date") || format(new Date(), "yyyy-MM-dd"),
    sortBy: "time",
    busType: "",
  });

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const data = await getTrips();
        setTrips(data);
      } catch (e) {
        // hata yönetimi
      }
      setLoading(false);
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    let filtered = trips.filter((trip: Trip) => {
      const matchesRoute =
        (!filters.origin || trip.origin === filters.origin) &&
        (!filters.destination || trip.destination === filters.destination);
      const matchesDate = !filters.date || trip.departureDate === filters.date;
      return matchesRoute && matchesDate;
    });
    setFilteredTrips(filtered);
  }, [filters, trips]);

  const handleTripSelect = (trip: Trip) => {
    navigate(`/booking/${trip.id}`);
  };

  const swapCities = () => {
    setFilters({
      ...filters,
      origin: filters.destination,
      destination: filters.origin,
    });
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (filters.origin) params.set("origin", filters.origin);
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.date) params.set("date", filters.date);
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nereden
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filters.origin}
                onChange={(e) =>
                  setFilters({ ...filters, origin: e.target.value })
                }
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end justify-center">
            <button
              onClick={swapCities}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowRight className="h-6 w-6 transform rotate-90 md:rotate-0" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nereye
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filters.destination}
                onChange={(e) =>
                  setFilters({ ...filters, destination: e.target.value })
                }
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm şehirler</option>
                {cities
                  .filter((city) => city !== filters.origin)
                  .map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filtrele</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sırala
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="time">Kalkış saatine göre</option>
                <option value="price">Fiyata göre</option>
                <option value="duration">Süreye göre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otobüs Tipi
              </label>
              <select
                value={filters.busType}
                onChange={(e) =>
                  setFilters({ ...filters, busType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm tipler</option>
                <option value="Standard">Standard</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Uygun Seferler ({filteredTrips.length})
          </h2>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sefer bulunamadı
            </h3>
            <p className="text-gray-600">
              Arama kriterlerinizi değiştirerek tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onSelect={handleTripSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
