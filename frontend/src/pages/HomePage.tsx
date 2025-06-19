import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, ArrowRight, Bus, Shield, Clock, Users } from 'lucide-react';
import { cities } from '../data/mockData';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const HomePage: React.FC = () => {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.origin && searchData.destination && searchData.date) {
      navigate(`/trips?origin=${searchData.origin}&destination=${searchData.destination}&date=${searchData.date}`);
    }
  };

  const swapCities = () => {
    setSearchData({
      ...searchData,
      origin: searchData.destination,
      destination: searchData.origin,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Türkiye'nin En Güvenilir
              <span className="block text-blue-200">Otobüs Rezervasyon Sistemi</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Konforlu yolculuklar, güvenilir hizmet ve kolay rezervasyon. 
              Hayalinizdeki seyahate bugün başlayın.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Origin */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nereden
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={searchData.origin}
                      onChange={(e) => setSearchData({ ...searchData, origin: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex items-end justify-center">
                  <button
                    type="button"
                    onClick={swapCities}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ArrowRight className="h-6 w-6 transform rotate-90 md:rotate-0" />
                  </button>
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nereye
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={searchData.destination}
                      onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {cities.filter(city => city !== searchData.origin).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Sefer Ara</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden BusTravel?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Yolculuklarınızı daha konforlu ve güvenli hale getiren özelliklerimiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Filo</h3>
              <p className="text-gray-600">
                Yeni ve konforlu otobüslerimizle güvenli yolculuk deneyimi
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">
                SSL sertifikası ile korunan güvenli ödeme sistemi
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">7/24 Destek</h3>
              <p className="text-gray-600">
                Anında müşteri desteği ve kolay bilet iptali
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kolay Rezervasyon</h3>
              <p className="text-gray-600">
                Birkaç tıkla biletinizi alın, koltuğunuzu seçin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hemen Rezervasyon Yapın
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Üye olun, özel fırsatlardan yararlanın ve biletlerinizi kolayca yönetin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Üye Ol
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;