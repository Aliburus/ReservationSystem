# Otobüs Firması Randevu Sistemi - PRD

## 1. Amaç

Otobüs firması çalışanlarının (admin) yolcu rezervasyonlarını ve seferleri kolayca yönetebileceği bir sistem.

## 2. Roller

- **Kullanıcı (Yolcu):** Sadece bilgi almak için siteyi kullanır, rezervasyon ve kayıt işlemlerini admin yapar.
- **Admin (Firma Yetkilisi):** Tüm kullanıcı, rezervasyon ve sefer işlemlerini yönetir.

## 3. Kullanıcı (Yolcu) Özellikleri

- Rezervasyon ve bilet işlemlerini admin aracılığıyla yaptırır
- Kendi bilgilerini admin ile paylaşır, admin sisteme girer

## 4. Admin Paneli Özellikleri

- Admin giriş ekranı
- Kullanıcı (yolcu) ekleme/düzenleme/silme
- Sefer ekleme/düzenleme/silme
  - Kalkış/Varış noktası
  - Kalkış tarihi & saati
  - Otobüs bilgileri (plaka, koltuk sayısı)
  - Otobüs tanımlama (koltuk planı ile)
- Toplu sefer yükleme (CSV/Excel ile import)
- Rezervasyon oluşturma/düzenleme/iptal
- Rezervasyon listesi görüntüleme
- Kullanıcı listesi ve bilgileri
- Satış raporları ve analizler
  - En çok bilet alan kullanıcı
  - En yoğun güzergah
  - Toplam satış
- Takvim tabanlı sefer yönetimi (FullCalendar.js)
- Bildirimler (bilet iptal, onay, ödeme tamamlandı)

## 5. Teknik Gereksinimler

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js (Express.js) + TypeScript + MongoDB
- **Auth:** HTTP Cookie tabanlı (sadece admin için)
- **Takvim:** FullCalendar.js
- **Koltuk seçimi:** İnteraktif grid
- **Toplu veri yükleme:** CSV dosya desteği
- **Responsive tasarım**

## 6. Kullanılabilirlik

- Mobil uyumlu
- Kolay ve hızlı sefer arama
- Renklerle doluluk durumu
- Bildirim sistemi

## 7. Güvenlik

- Cookie güvenliği (HttpOnly, Secure, SameSite)
- Yetkilendirme kontrolü (sadece admin erişimi)

## 8. Ek Notlar

- Kod ve veri güvenliğine dikkat edilecek.
- Kullanıcı deneyimi ön planda olacak.

Frontend eksikler
[ ] Takvim tabanlı sefer yönetimi (FullCalendar.js ile görsel takvim yok)
[ ] Toplu sefer yükleme UI (CSV/Excel dosya seçme ve yükleme butonu yok)
[ ] Koltuk planında renkli doluluk (SeatMap’te dolu/boş koltuklar renkli gösteriliyor mu, net değil)
[ ] Satış/analiz raporları (dashboard’da temel analiz var, ama detaylı rapor UI’si yok)
