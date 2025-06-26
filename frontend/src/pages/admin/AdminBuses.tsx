import React, { useEffect, useState } from "react";
import {
  getBuses,
  createBus,
  updateBus,
  deleteBus,
} from "../../services/busService";
import { getTrips, deleteTrip } from "../../services/tripService";
import { getDrivers, updateDriver } from "../../services/driverService";
import { Bus, Plus, X, Edit2, Trash2 } from "lucide-react";
import Spinner from "../../components/Common/Spinner";

const AdminBuses: React.FC = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBus, setNewBus] = useState({
    plate: "",
    seat_count: 45,
    type: "2+1",
  });
  const [editBus, setEditBus] = useState<any | null>(null);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [busTrips, setBusTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteAllResult, setDeleteAllResult] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  const fetchBuses = async () => {
    setLoading(true);
    const data = await getBuses();
    setBuses(data);
    setLoading(false);
  };

  const fetchTrips = async () => {
    const data = await getTrips();
    setTrips(data);
  };

  const fetchDrivers = async () => {
    const data = await getDrivers();
    setDrivers(data);
  };

  useEffect(() => {
    fetchBuses();
    fetchTrips();
    fetchDrivers();
  }, []);

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBus(newBus);
    setShowAddForm(false);
    setNewBus({ plate: "", seat_count: 45, type: "2+1" });
    fetchBuses();
    fetchTrips();
  };

  const handleEditBus = (bus: any) => {
    setEditBus(bus);
    setShowAddForm(true);
    setNewBus({ plate: bus.plate, seat_count: bus.seat_count, type: bus.type });
  };

  const handleUpdateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBus) return;
    await updateBus(editBus._id, newBus);
    setShowAddForm(false);
    setEditBus(null);
    setNewBus({ plate: "", seat_count: 45, type: "2+1" });
    fetchBuses();
    fetchTrips();
  };

  const handleDeleteBus = async (busId: string) => {
    if (window.confirm("Bu otobüsü silmek istediğinizden emin misiniz?")) {
      await deleteBus(busId);
      fetchBuses();
      fetchTrips();
    }
  };

  const openBusTrips = async (bus: any) => {
    setSelectedBus(bus);
    setLoadingTrips(true);
    const allTrips = await getTrips();
    setBusTrips(allTrips.filter((t: any) => t.bus_id === bus._id));
    setLoadingTrips(false);
  };

  const handleDeleteTrip = async (tripId: string) => {
    await deleteTrip(tripId);
    if (selectedBus) openBusTrips(selectedBus);
  };

  const handleDeleteAllTrips = async () => {
    setDeleteAllLoading(true);
    setDeleteAllResult("");
    let success = 0;
    let fail = 0;
    for (const trip of busTrips) {
      try {
        await deleteTrip(trip._id);
        success++;
      } catch {
        fail++;
      }
    }
    setDeleteAllLoading(false);
    setBusTrips([]);
    if (success > 0 && fail === 0)
      setDeleteAllResult("Tüm seferler başarıyla silindi.");
    else if (success > 0 && fail > 0)
      setDeleteAllResult(`${success} sefer silindi, ${fail} sefer silinemedi.`);
    else setDeleteAllResult("Hiçbir sefer silinemedi.");
  };

  // Otobüsün durumunu hesapla
  const getBusStatus = (bus: any) => {
    const now = new Date();
    // Aktif sefer (başlamış veya devam eden)
    const activeTrip = trips.find(
      (trip: any) =>
        trip.bus_id === bus._id &&
        trip.status === "active" &&
        new Date(trip.date) <= now &&
        new Date(trip.date).getTime() + 1000 * 60 * 60 * 24 > now.getTime() // 1 gün boyunca aktif say
    );
    if (activeTrip)
      return { label: "Seferde", color: "bg-green-100 text-green-700" };
    // Gelecekteki en yakın sefer
    const futureTrips = trips
      .filter(
        (trip: any) =>
          trip.bus_id === bus._id &&
          trip.status === "active" &&
          new Date(trip.date) > now
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    if (futureTrips.length > 0) {
      const diffMs = new Date(futureTrips[0].date).getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        label: `Sefere ${diffDays} gün kaldı`,
        color: "bg-blue-100 text-blue-700",
      };
    }
    // Hiç trip yoksa veya hepsi geçmişteyse
    return { label: "Boş", color: "bg-gray-100 text-gray-700" };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            <Bus className="h-8 w-8 text-blue-600" /> Otobüs Yönetimi
          </h1>
          <p className="text-gray-600 text-lg">Otobüsleri ekleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-base font-semibold"
        >
          <Plus className="h-5 w-5" /> Yeni Otobüs
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative border">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
            >
              <X className="h-7 w-7" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editBus ? "Otobüs Düzenle" : "Yeni Otobüs Ekle"}
            </h2>
            <form
              className="space-y-5"
              onSubmit={editBus ? handleUpdateBus : handleAddBus}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Plaka</label>
                <input
                  type="text"
                  value={newBus.plate}
                  onChange={(e) =>
                    setNewBus({ ...newBus, plate: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Koltuk Sayısı
                </label>
                <input
                  type="number"
                  value={newBus.seat_count}
                  onChange={(e) =>
                    setNewBus({ ...newBus, seat_count: Number(e.target.value) })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min={10}
                  max={60}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <select
                  value={newBus.type}
                  onChange={(e) =>
                    setNewBus({ ...newBus, type: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="2+1">2+1</option>
                  <option value="2+2">2+2</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow"
                >
                  {editBus ? "Güncelle" : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBus ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedBus.plate} Seferleri
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBus(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
              >
                Geri
              </button>
              <button
                onClick={handleDeleteAllTrips}
                className={`px-4 py-2 rounded font-semibold ${
                  busTrips.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                disabled={busTrips.length === 0}
              >
                Tüm Seferleri Sil
              </button>
            </div>
          </div>
          {/* Şoförler Atama Alanı */}
          <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Atanmış Şoförler</h3>
            <ul className="mb-2">
              {drivers.filter((d) => d.assignedBus === selectedBus._id)
                .length === 0 ? (
                <li className="text-gray-500">Şoför atanmadı</li>
              ) : (
                drivers
                  .filter((d) => d.assignedBus === selectedBus._id)
                  .map((driver) => (
                    <li
                      key={driver._id}
                      className="flex items-center justify-between py-1"
                    >
                      <span>
                        {driver.name}{" "}
                        <span className="text-xs text-gray-400 ml-2">
                          {driver.phone}
                        </span>
                      </span>
                      <button
                        className="text-red-500 text-xs hover:underline"
                        onClick={async () => {
                          await updateDriver(driver._id, {
                            ...driver,
                            assignedBus: null,
                          });
                          fetchDrivers();
                        }}
                      >
                        Çıkar
                      </button>
                    </li>
                  ))
              )}
            </ul>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
              onClick={() => setShowAssignModal(true)}
            >
              + Yeni Şoför Ata
            </button>
            {showAssignModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative border">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-6">Şoför Ata</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (selectedDrivers.length === 0) {
                        alert("En az 1 şoför seçmelisiniz!");
                        return;
                      }
                      await Promise.all(
                        selectedDrivers.map((id: string) => {
                          const driver = drivers.find((d) => d._id === id);
                          return updateDriver(id, {
                            ...driver,
                            assignedBus: selectedBus._id,
                          });
                        })
                      );
                      setShowAssignModal(false);
                      setSelectedDrivers([]);
                      fetchDrivers();
                    }}
                    className="flex flex-col gap-2 mt-2"
                  >
                    <div className="flex flex-wrap gap-4">
                      {drivers
                        .filter((d) => !d.assignedBus)
                        .map((driver) => (
                          <label
                            key={driver._id}
                            className="flex items-center gap-2 border rounded px-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              name="driver"
                              value={driver._id}
                              checked={selectedDrivers.includes(driver._id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedDrivers([
                                    ...selectedDrivers,
                                    driver._id,
                                  ]);
                                else
                                  setSelectedDrivers(
                                    selectedDrivers.filter(
                                      (id) => id !== driver._id
                                    )
                                  );
                              }}
                            />
                            {driver.name}{" "}
                            <span className="text-xs text-gray-400 ml-1">
                              {driver.phone}
                            </span>
                          </label>
                        ))}
                    </div>
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
                    >
                      Ata
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* Sefer Listesi */}
          {deleteAllLoading && <Spinner />}
          {deleteAllResult && (
            <div
              className={`mb-4 px-4 py-2 rounded text-sm font-semibold ${
                deleteAllResult.includes("başarı")
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {deleteAllResult}
            </div>
          )}
          {loadingTrips ? (
            <Spinner />
          ) : busTrips.length === 0 ? (
            <div className="text-gray-500">Bu otobüse ait sefer yok.</div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
              {busTrips.map((trip) => (
                <li
                  key={trip._id}
                  className="flex items-center justify-between bg-white rounded p-3 shadow-sm border"
                >
                  <span>
                    {trip.from} → {trip.to} | {trip.date?.slice(0, 10)}{" "}
                    {trip.departureTime} - {trip.arrivalTime}
                  </span>
                  <button
                    onClick={() => handleDeleteTrip(trip._id)}
                    className="ml-4 p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Seferi Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Otobüsler</h2>
          {loading ? (
            <Spinner />
          ) : buses.length === 0 ? (
            <div>Otobüs bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus: any) => {
                const status = getBusStatus(bus);
                return (
                  <div
                    key={bus._id}
                    className="border rounded-xl p-4 shadow bg-white hover:shadow-lg transition-all duration-150 min-w-[260px] max-w-[320px] flex flex-col justify-between"
                    onClick={() => openBusTrips(bus)}
                  >
                    {/* Plaka */}
                    <div className="text-center font-bold text-lg text-blue-700 tracking-widest mb-2 select-text">
                      {bus.plate}
                    </div>
                    {/* Koltuk ve Tip */}
                    <div className="flex justify-center gap-4 text-gray-700 text-sm mb-2">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 17v-5a2 2 0 012-2h12a2 2 0 012 2v5" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {bus.seat_count} Koltuk
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="7" width="18" height="10" rx="2" />
                          <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2" />
                        </svg>
                        {bus.type}
                      </span>
                    </div>
                    {/* Sefer Durumu */}
                    <div
                      className={`text-center text-xs font-semibold rounded py-1 mb-2 ${status.color}`}
                    >
                      {status.label}
                    </div>
                    {/* Butonlar */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBus(bus);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs border border-blue-100"
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" /> Düzenle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBus(bus._id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 p-1 text-red-600 hover:bg-red-50 rounded transition-colors text-xs border border-red-100"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" /> Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBuses;
