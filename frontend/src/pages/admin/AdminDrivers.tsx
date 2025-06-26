import React, { useEffect, useState } from "react";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../../services/driverService";
import { getBuses } from "../../services/busService";
import Spinner from "../../components/Common/Spinner";

const AdminDrivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", assignedBus: "" });

  const fetchAll = async () => {
    setLoading(true);
    const [driversData, busesData] = await Promise.all([
      getDrivers(),
      getBuses(),
    ]);
    setDrivers(driversData);
    setBuses(busesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editDriver) {
      await updateDriver(editDriver._id, form);
    } else {
      await createDriver(form);
    }
    setShowForm(false);
    setEditDriver(null);
    setForm({ name: "", phone: "", assignedBus: "" });
    fetchAll();
  };

  const handleEdit = (driver: any) => {
    setEditDriver(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      assignedBus: driver.assignedBus || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Şoförü silmek istiyor musunuz?")) {
      await deleteDriver(id);
      fetchAll();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Şoförler</h1>
      <div className="bg-white rounded-xl shadow border p-6">
        {loading ? (
          <Spinner />
        ) : !drivers || drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-4">Şoför bulunamadı</div>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700"
              onClick={() => {
                setShowForm(true);
                setEditDriver(null);
                setForm({ name: "", phone: "", assignedBus: "" });
              }}
            >
              Yeni Şoför Ekle
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4 min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Ad Soyad
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Telefon
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Atandığı Otobüs
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr
                      key={driver._id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-base">
                          {driver.name?.charAt(0) || "Ş"}
                        </span>
                        <span className="font-medium text-gray-900">
                          {driver.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {driver.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {buses.find((b) => b._id === driver.assignedBus)
                          ?.plate || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          className="text-blue-600 hover:underline mr-3 font-medium"
                          onClick={() => handleEdit(driver)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="text-red-600 hover:underline font-medium"
                          onClick={() => handleDelete(driver._id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow"
              onClick={() => {
                setShowForm(true);
                setEditDriver(null);
                setForm({ name: "", phone: "", assignedBus: "" });
              }}
            >
              Yeni Şoför Ekle
            </button>
          </>
        )}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative border">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-6">
                {editDriver ? "Şoför Düzenle" : "Yeni Şoför Ekle"}
              </h2>
              <form className="space-y-5" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Atanacak Otobüs
                  </label>
                  <select
                    value={form.assignedBus}
                    onChange={(e) =>
                      setForm({ ...form, assignedBus: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Seçiniz</option>
                    {buses.map((bus) => (
                      <option key={bus._id} value={bus._id}>
                        {bus.plate}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDrivers;
