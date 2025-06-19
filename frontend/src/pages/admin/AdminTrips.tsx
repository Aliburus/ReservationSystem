import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { mockTrips, mockBuses, cities } from '../../data/mockData';
import { Trip, Bus } from '../../types';
import TripCard from '../../components/Common/TripCard';

const AdminTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    busType: '',
  });

  const [newTrip, setNewTrip] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalTime: '',
    busPlate: '',
    price: 0,
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.busPlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.origin || trip.origin === filters.origin) &&
      (!filters.destination || trip.destination === filters.destination) &&
      (!filters.date || trip.departureDate === filters.date) &&
      (!filters.busType || trip.busType === filters.busType);

    return matchesSearch && matchesFilters;
  });

  const calculateDuration = (departure: string, arrival: string) => {
    const [depHour, depMin] = departure.split(':').map(Number);
    const [arrHour, arrMin] = arrival.split(':').map(Number);
    
    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Next day arrival
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bus = mockBuses.find(b => b.plate === newTrip.busPlate);
    if (!bus) return;

    const trip: Trip = {
      id: `trip_${Date.now()}`,
      origin: newTrip.origin,
      destination: newTrip.destination,
      departureDate: newTrip.departureDate,
      departureTime: newTrip.departureTime,
      arrivalTime: newTrip.arrivalTime,
      busPlate: newTrip.busPlate,
      totalSeats: bus.totalSeats,
      availableSeats: bus.totalSeats,
      price: newTrip.price,
      busType: bus.type,
      duration: calculateDuration(newTrip.departureTime, newTrip.arrivalTime),
    };

    setTrips([...trips, trip]);
    setShowAddForm(false);
    setNewTrip({
      origin: '',
      destination: '',
      departureDate: '',
      departureTime: '',
      arrivalTime: '',
      busPlate: '',
      price: 0,
    });
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setNewTrip({
      origin: trip.origin,
      destination: trip.destination,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      busPlate: trip.busPlate,
      price: trip.price,
    });
    setShowAddForm(true);
  };

  const handleUpdateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    const bus = mockBuses.find(b => b.plate === newTrip.busPlate);
    if (!bus) return;

    const updatedTrip: Trip = {
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

    setTrips(trips.map(t => t.id === editingTrip.id ? updatedTrip : t));
    setShowAddForm(false);
    setEditingTrip(null);
    setNewTrip({
      origin: '',
      destination: '',
      departureDate: '',
      departureTime: '',
      arrivalTime: '',
      busPlate: '',
      price: 0,
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Bu seferi silmek istediğinizden emin misiniz?')) {
      setTrips(trips.filter(t => t.id !== tripId));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTrip(null);
    setNewTrip({
      origin: '',
      destination: '',
      departureDate: '',
      departureTime: '',
      arrivalTime: '',
      busPlate: '',
      price: 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sefer Yönetimi</h1>
          <p className="text-gray-600 mt-2">Otobüs seferlerini ekleyin, düzenleyin ve yönetin</p>
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
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingTrip ? 'Sefer Düzenle' : 'Yeni Sefer Ekle'}
          </h2>
          
          <form onSubmit={editingTrip ? handleUpdateTrip : handleAddTrip} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kalkış Şehri
                </label>
                <select
                  value={newTrip.origin}
                  onChange={(e) => setNewTrip({...newTrip, origin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varış Şehri
                </label>
                <select
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities.filter(city => city !== newTrip.origin).map(city => (
                    <option key={city} value={city}>{city}</option>
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
                  onChange={(e) => setNewTrip({...newTrip, departureDate: e.target.value})}
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
                  onChange={(e) => setNewTrip({...newTrip, busPlate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Otobüs seçin</option>
                  {mockBuses.map(bus => (
                    <option key={bus.id} value={bus.plate}>
                      {bus.plate} - {bus.type} ({bus.totalSeats} koltuk)
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
                  onChange={(e) => setNewTrip({...newTrip, departureTime: e.target.value})}
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
                  onChange={(e) => setNewTrip({...newTrip, arrivalTime: e.target.value})}
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
                  onChange={(e) => setNewTrip({...newTrip, price: Number(e.target.value)})}
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
                {editingTrip ? 'Güncelle' : 'Ekle'}
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
              onChange={(e) => setFilters({...filters, origin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm kalkış noktaları</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.destination}
              onChange={(e) => setFilters({...filters, destination: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm varış noktaları</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
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
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <TripCard trip={trip} onSelect={() => {}} showSelectButton={false} />
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
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrips;