import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, User, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { mockReservations, mockTrips, mockUsers } from '../../data/mockData';
import { Reservation, Trip, User as UserType } from '../../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredReservations = reservations.filter(reservation => {
    const trip = mockTrips.find(t => t.id === reservation.tripId);
    const user = mockUsers.find(u => u.id === reservation.userId);
    
    const matchesSearch = 
      reservation.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.passengerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip && (trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                trip.destination.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (user && (user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = !statusFilter || reservation.status === statusFilter;
    const matchesDate = !dateFilter || reservation.bookingDate.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleUpdateReservationStatus = (reservationId: string, newStatus: 'confirmed' | 'cancelled') => {
    setReservations(prev => 
      prev.map(r => r.id === reservationId ? { ...r, status: newStatus } : r)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Beklemede';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
  };

  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
        <p className="text-gray-600 mt-2">Tüm rezervasyonları görüntüleyin ve yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Rezervasyon</p>
              <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">İptal Edilen</p>
              <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{totalRevenue.toLocaleString()}</p>
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
                placeholder="Rezervasyon ara (yolcu adı, telefon, güzergah)..."
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
                <option value="">Tüm durumlar</option>
                <option value="confirmed">Onaylandı</option>
                <option value="cancelled">İptal Edildi</option>
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
                    Rezervasyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yolcu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sefer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koltuklar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => {
                  const trip = mockTrips.find(t => t.id === reservation.tripId);
                  const user = mockUsers.find(u => u.id === reservation.userId);
                  
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{reservation.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(reservation.bookingDate), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.passengerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.passengerPhone}
                          </div>
                          {user && (
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trip && (
                          <div>
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              {trip.origin} → {trip.destination}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(trip.departureDate), 'dd/MM/yyyy')} - {trip.departureTime}
                            </div>
                            <div className="text-xs text-gray-400">
                              {trip.busPlate}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.seatNumbers.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.seatNumbers.length} koltuk
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₺{reservation.totalPrice}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusText(reservation.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                            >
                              İptal Et
                            </button>
                          )}
                          {reservation.status === 'cancelled' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(reservation.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                            >
                              Onayla
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
    </div>
  );
};

export default AdminReservations;