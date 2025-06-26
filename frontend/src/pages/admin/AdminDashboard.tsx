import React, { useEffect, useState } from "react";
import {
  Bus,
  Calendar,
  TrendingUp,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { getReservations } from "../../services/reservationService";
import { getTrips } from "../../services/tripService";
import { getBuses } from "../../services/busService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Spinner from "../../components/Common/Spinner";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalReservations: 0,
    totalRevenue: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [yearLabels, setYearLabels] = useState<string[]>([]);
  const [selectedYearForTotal, setSelectedYearForTotal] = useState(() =>
    new Date().getFullYear()
  );
  const [selectedYearForMonthlyChart, setSelectedYearForMonthlyChart] =
    useState(() => new Date().getFullYear());
  const [selectedYearForRouteChart, setSelectedYearForRouteChart] = useState(
    () => new Date().getFullYear()
  );
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [yearlyData, setYearlyData] = useState<number[]>([]);
  const [topRoutes, setTopRoutes] = useState<
    { route: string; revenue: number }[]
  >([]);
  const [selectedMonthForRouteChart, setSelectedMonthForRouteChart] =
    useState(0);
  const [avgOccupancy, setAvgOccupancy] = useState(0);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const busesData = await getBuses();
      setBuses(busesData);
      const trips = await getTrips();
      const reservations = await getReservations();
      // Seçili ayın başlangıcı ve bitişi
      const [yearForMonth, month] = selectedMonth.split("-").map(Number);
      const start = new Date(yearForMonth, month - 1, 1, 0, 0, 0);
      const end = new Date(yearForMonth, month, 0, 23, 59, 59); // ayın son günü
      // Her rezervasyon için ilgili trip'i bul
      const filtered = reservations.filter((r: any) => {
        if (r.status !== "active") return false;
        // Öncelik: created_at, yoksa trip.date
        let date: Date | null = null;
        if (r.created_at) date = new Date(r.created_at);
        else {
          const trip = trips.find(
            (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
          );
          if (trip && trip.date) date = new Date(trip.date);
        }
        if (!date) return false;
        return date >= start && date <= end;
      });
      // Her rezervasyon için fiyatı bul
      const revenue = filtered.reduce((sum: number, r: any) => {
        if (r.totalPrice) return sum + r.totalPrice;
        const trip = trips.find(
          (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
        );
        return sum + (trip?.price || 0);
      }, 0);
      setMonthlyRevenue(revenue);
      const totalTrips = trips.length;
      const totalReservations = reservations.length;
      const totalRevenue = reservations
        .filter((r: any) => r.status === "active")
        .reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);
      const today = new Date().toISOString().split("T")[0];
      const activeTrips = trips.filter(
        (t: any) => (t.date || t.departureDate) >= today
      ).length;
      const completedTrips = trips.filter(
        (t: any) => (t.date || t.departureDate) < today
      ).length;
      const cancelledReservations = reservations.filter(
        (r: any) => r.status === "cancelled"
      ).length;
      setStats({
        totalTrips,
        totalReservations,
        totalRevenue,
        activeTrips,
        completedTrips,
        cancelledReservations,
      });
      setRecentReservations(reservations.slice(0, 5));
      // Yıllık gelir kutusu için
      const yearlyStart = new Date(selectedYearForTotal, 0, 1, 0, 0, 0);
      const yearlyEnd = new Date(selectedYearForTotal, 11, 31, 23, 59, 59);
      const yearlyFiltered = reservations.filter((r: any) => {
        if (r.status !== "active") return false;
        const trip = trips.find(
          (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
        );
        if (!trip || !trip.date) return false;
        const tripDate = new Date(trip.date);
        return tripDate >= yearlyStart && tripDate <= yearlyEnd;
      });
      const yearlyRevenueCalc = yearlyFiltered.reduce((sum: number, r: any) => {
        if (r.totalPrice) return sum + r.totalPrice;
        const trip = trips.find(
          (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
        );
        return sum + (trip?.price || 0);
      }, 0);
      setYearlyRevenue(yearlyRevenueCalc);
      // Aylık gelir chartı için
      const months = Array.from({ length: 12 }, (_, i) => i);
      const monthLabels = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      setYearLabels(monthLabels);
      const monthlyTotals = months.map((m) => {
        const start = new Date(selectedYearForMonthlyChart, m, 1, 0, 0, 0);
        const end = new Date(selectedYearForMonthlyChart, m + 1, 0, 23, 59, 59);
        const filtered = reservations.filter((r: any) => {
          if (r.status !== "active") return false;
          const trip = trips.find(
            (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
          );
          if (!trip || !trip.date) return false;
          const tripDate = new Date(trip.date);
          return tripDate >= start && tripDate <= end;
        });
        return filtered.reduce((sum: number, r: any) => {
          if (r.totalPrice) return sum + r.totalPrice;
          const trip = trips.find(
            (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
          );
          return sum + (trip?.price || 0);
        }, 0);
      });
      setYearlyData(monthlyTotals);
      // Rota chartı için
      const routeRevenue: { [route: string]: number } = {};
      reservations.forEach((r: any) => {
        if (r.status !== "active") return;
        const trip = trips.find(
          (t: any) => t._id === r.trip_id || t.trip_id === r.trip_id
        );
        if (!trip || !trip.date) return;
        const tripDate = new Date(trip.date);
        if (tripDate.getFullYear() !== selectedYearForRouteChart) return;
        if (
          selectedMonthForRouteChart !== 0 &&
          tripDate.getMonth() + 1 !== selectedMonthForRouteChart
        )
          return;
        const route = `${trip.from} - ${trip.to}`;
        const price = r.totalPrice || trip.price || 0;
        routeRevenue[route] = (routeRevenue[route] || 0) + price;
      });
      const sortedRoutes = Object.entries(routeRevenue)
        .map(([route, revenue]) => ({ route, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopRoutes(sortedRoutes);
      // Ortalama doluluk oranı hesaplama
      const validTrips = trips.filter((t: any) => t.bus_id && t.date);
      let totalSeats = 0;
      let totalSold = 0;
      validTrips.forEach((trip: any) => {
        const bus = busesData.find((b: any) => b._id === trip.bus_id);
        if (!bus) return;
        totalSeats += bus.seat_count;
        const tripReservations = reservations.filter(
          (r: any) => r.trip_id === trip._id && r.status === "active"
        );
        tripReservations.forEach((r: any) => {
          if (Array.isArray(r.seats)) totalSold += r.seats.length;
          else totalSold += 1;
        });
      });
      setAvgOccupancy(
        totalSeats > 0 ? Math.round((totalSold / totalSeats) * 100) : 0
      );
      setLoading(false);
    };
    fetchData();
  }, [
    selectedYearForTotal,
    selectedYearForMonthlyChart,
    selectedYearForRouteChart,
    selectedMonthForRouteChart,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <Bus className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">Toplam Sefer</div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.totalTrips}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-xs text-gray-500">Aktif Seferler</div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.activeTrips}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <Activity className="h-5 w-5 text-indigo-500" />
              <div>
                <div className="text-xs text-gray-500">Tamamlanan Seferler</div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.completedTrips}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-xs text-gray-500">Toplam Rezervasyon</div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.totalReservations}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-xs text-gray-500">Yıllık Gelir</div>
                <div className="text-lg font-bold text-gray-900">
                  ₺{yearlyRevenue.toLocaleString("tr-TR")}
                </div>
                <select
                  className="mt-1 border rounded px-2 py-1 text-xs"
                  value={selectedYearForTotal}
                  onChange={(e) =>
                    setSelectedYearForTotal(Number(e.target.value))
                  }
                >
                  {Array.from(
                    { length: 6 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-xs text-gray-500">
                  İptal Edilen Rezervasyonlar
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {stats.cancelledReservations}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3 shadow-sm">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              <div>
                <div className="text-xs text-gray-500">Ortalama Doluluk</div>
                <div className="text-lg font-bold text-gray-900">
                  %{avgOccupancy}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md border p-2 shadow-sm mb-3">
            <div className="flex items-center mb-1">
              <h2 className="text-sm font-semibold mr-2">Yıllık Gelir (₺)</h2>
              <select
                className="border rounded px-1 py-0.5 text-xs"
                value={selectedYearForMonthlyChart}
                onChange={(e) =>
                  setSelectedYearForMonthlyChart(Number(e.target.value))
                }
              >
                {Array.from(
                  { length: 6 },
                  (_, i) => new Date().getFullYear() - 2 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Bar
              data={{
                labels: yearLabels,
                datasets: [
                  {
                    label: "",
                    data: yearlyData,
                    backgroundColor: "#3b82f6",
                    borderRadius: 2,
                    barPercentage: 0.25,
                    categoryPercentage: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8", font: { size: 10 } },
                  },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: {
                      color: "#94a3b8",
                      font: { size: 10 },
                      callback: (v: any) => `₺${v}`,
                    },
                    beginAtZero: true,
                  },
                },
                layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
                elements: { bar: { borderWidth: 0 } },
              }}
              height={80}
            />
          </div>
          {topRoutes.length > 0 ? (
            <div className="bg-white rounded-md border p-2 shadow-sm mb-3">
              <div className="flex items-center mb-1">
                <h2 className="text-sm font-semibold mr-2">
                  En Çok Gelir Getiren 10 Rota
                </h2>
                <select
                  className="border rounded px-1 py-0.5 text-xs mr-1"
                  value={selectedYearForRouteChart}
                  onChange={(e) =>
                    setSelectedYearForRouteChart(Number(e.target.value))
                  }
                >
                  {Array.from(
                    { length: 6 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded px-1 py-0.5 text-xs"
                  value={selectedMonthForRouteChart}
                  onChange={(e) =>
                    setSelectedMonthForRouteChart(Number(e.target.value))
                  }
                >
                  <option value={0}>Tüm Aylar</option>
                  {[
                    "Ocak",
                    "Şubat",
                    "Mart",
                    "Nisan",
                    "Mayıs",
                    "Haziran",
                    "Temmuz",
                    "Ağustos",
                    "Eylül",
                    "Ekim",
                    "Kasım",
                    "Aralık",
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <Bar
                data={{
                  labels: topRoutes.map((r) => r.route),
                  datasets: [
                    {
                      label: "",
                      data: topRoutes.map((r) => r.revenue),
                      backgroundColor: "#6366f1",
                      borderRadius: 2,
                      barPercentage: 0.25,
                      categoryPercentage: 0.4,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: {
                      grid: { color: "#f1f5f9" },
                      ticks: {
                        color: "#94a3b8",
                        font: { size: 10 },
                        callback: (v: any) => `₺${v}`,
                      },
                      beginAtZero: true,
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: "#94a3b8", font: { size: 10 } },
                    },
                  },
                  layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
                  elements: { bar: { borderWidth: 0 } },
                }}
                height={80}
              />
            </div>
          ) : (
            <div className="bg-white rounded-md border p-2 shadow-sm mb-3">
              <div className="flex items-center mb-1">
                <h2 className="text-sm font-semibold mr-2">
                  En Çok Gelir Getiren 10 Rota
                </h2>
                <select
                  className="border rounded px-1 py-0.5 text-xs mr-1"
                  value={selectedYearForRouteChart}
                  onChange={(e) =>
                    setSelectedYearForRouteChart(Number(e.target.value))
                  }
                >
                  {Array.from(
                    { length: 6 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded px-1 py-0.5 text-xs"
                  value={selectedMonthForRouteChart}
                  onChange={(e) =>
                    setSelectedMonthForRouteChart(Number(e.target.value))
                  }
                >
                  <option value={0}>Tüm Aylar</option>
                  {[
                    "Ocak",
                    "Şubat",
                    "Mart",
                    "Nisan",
                    "Mayıs",
                    "Haziran",
                    "Temmuz",
                    "Ağustos",
                    "Eylül",
                    "Ekim",
                    "Kasım",
                    "Aralık",
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center text-gray-400 py-6 text-xs">
                Veri bulunamadı
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
