# Otobüs Rezervasyon Sistemi

## Açıklama

Modern, kullanıcı dostu otobüs bileti rezervasyon ve yönetim sistemi. Sefer, otobüs, şoför, rezervasyon ve gelir raporlarını tek panelden yönetin.

## Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone <repo-url>
   cd Project
   ```
2. **Backend kurulumu:**
   ```bash
   cd backend
   npm install
   npm start
   ```
3. **Frontend kurulumu:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
4. Backend ve frontend için `.env` dosyalarını oluşturun (örn: `VITE_API_URL` ve Mongo bağlantısı).

## Kullanım

- Seferleri ve koltuk durumunu anlık görüntüleyin.
- Koltuk seçip hızlıca rezervasyon yapın.
- Yönetici panelinden sefer, otobüs, şoför ve rezervasyonları yönetin.
- Toplu fiyat güncelleme, gelir/hasılat raporu alın.
- Modern ve sade arayüzle kolay kullanım.

## Temel Özellikler

- Sefer, otobüs ve şoför yönetimi
- Koltuk haritası ve anlık doluluk
- Rezervasyon oluşturma, düzenleme, iptal
- Toplu fiyat güncelleme (yüzde, sabit, tarih/rota bazlı)
- Gelir/hasılat hesaplama
- Minimal ve modern yönetici paneli
- Türkçe ve kullanıcı dostu hata/başarı mesajları

## Teknolojiler

- **Frontend:** React, TypeScript, TailwindCSS, Vite
- **Backend:** Node.js, Express, TypeScript, MongoDB
- **Ekstra:** Axios, Lucide React, date-fns

## Lisans

MIT

## Ekran Görüntüleri

Uygulamanın örnek ekran görüntüleri `screenshots` klasöründe bulunmaktadır.

![Panel](screenshots/Dashboard.jpeg)
![Otobüs Listesi](screenshots/Bus.jpeg)
![Otobüs Detay](screenshots/BusDetails.jpeg)
![Şoförler](screenshots/Drivers.jpeg)
![Rezervasyonlar](screenshots/Reservations.jpeg)
![Seferler](screenshots/Trips.jpeg)
![Sefer Detay](screenshots/TripDetails.jpeg)
![Fiyat Güncelleme Modalı](screenshots/PriceUpdateModal.jpeg)
