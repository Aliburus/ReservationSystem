import React, { useState, useEffect } from "react";
import {
  Bus,
  Calendar,
  TrendingUp,
  CreditCard,
  BarChart3,
  Activity,
} from "lucide-react";
import { mockTrips, mockReservations } from "../../data/mockData";
import { format } from "date-fns";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalReservations: 0,
    totalRevenue: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledReservations: 0,
  });

  const [recentReservations] = useState(mockReservations.slice(0, 5));
  const [popularRoutes, setPopularRoutes] = useState<
    { route: string; count: number }[]
  >([]);

  useEffect(() => {
    // Calculate statistics
    const totalTrips = mockTrips.length;
    const totalReservations = mockReservations.length;
    const totalRevenue = mockReservations
      .filter((r) => r.status === "confirmed")
      .reduce((sum, r) => sum + r.totalPrice, 0);

    const today = new Date().toISOString().split("T")[0];
    const activeTrips = mockTrips.filter(
      (t) => t.departureDate >= today
    ).length;
    const completedTrips = mockTrips.filter(
      (t) => t.departureDate < today
    ).length;
    const cancelledReservations = mockReservations.filter(
      (r) => r.status === "cancelled"
    ).length;

    setStats({
      totalTrips,
      totalReservations,
      totalRevenue,
      activeTrips,
      completedTrips,
      cancelledReservations,
    });

    // Calculate popular routes
    const routeCount: { [key: string]: number } = {};
    mockReservations.forEach((reservation) => {
      const trip = mockTrips.find((t) => t.id === reservation.tripId);
      if (trip) {
        const route = `${trip.origin} - ${trip.destination}`;
        routeCount[route] = (routeCount[route] || 0) + 1;
      }
    });

    const sortedRoutes = Object.entries(routeCount)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setPopularRoutes(sortedRoutes);
  }, []);

  const statCards = [
    {
      title: "Toplam Sefer",
      value: stats.totalTrips,
      icon: Bus,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Aktif Seferler",
      value: stats.activeTrips,
      icon: Bus,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Toplam Rezervasyon",
      value: stats.totalReservations,
      icon: Calendar,
      color: "bg-purple-500",
      change: "+23%",
      changeType: "positive",
    },
    {
      title: "Toplam Gelir",
      value: `₺${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-orange-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Tamamlanan Seferler",
      value: stats.completedTrips,
      icon: Activity,
      color: "bg-indigo-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "İptal Edilen Rezervasyonlar",
      value: stats.cancelledReservations,
      icon: TrendingUp,
      color: "bg-red-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Ortalama Rezervasyon",
      value: `₺${Math.round(
        stats.totalRevenue / Math.max(stats.totalReservations, 1)
      )}`,
      icon: BarChart3,
      color: "bg-yellow-500",
      change: "+8%",
      changeType: "positive",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Sistem genel bakış ve istatistikler
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto justify-center">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">bu ay</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Reservations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Son Rezervasyonlar
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentReservations.map((reservation) => {
                const trip = mockTrips.find((t) => t.id === reservation.tripId);

                return (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {trip?.origin} → {trip?.destination}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {reservation.status === "confirmed"
                            ? "Onaylandı"
                            : "İptal"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(reservation.bookingDate),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₺{reservation.totalPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        Koltuk: {reservation.seatNumbers.join(", ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Popüler Güzergahlar
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularRoutes.map((route, index) => (
                <div
                  key={route.route}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{route.route}</p>
                      <p className="text-sm text-gray-600">
                        {route.count} rezervasyon
                      </p>
                    </div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (route.count /
                            Math.max(...popularRoutes.map((r) => r.count))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tamamlanan Seferler
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTrips}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                İptal Edilen Rezervasyonlar
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelledReservations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ortalama Rezervasyon
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₺
                {Math.round(
                  stats.totalRevenue / Math.max(stats.totalReservations, 1)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
