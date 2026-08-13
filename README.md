# 🚗 Garage Flow App

![Garage Flow App](https://img.shields.io/badge/Status-Development-blue.svg) ![Laravel 11](https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white) ![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white) ![Midtrans](https://img.shields.io/badge/Payment-Midtrans-blue?style=flat) ![Gemini AI](https://img.shields.io/badge/AI-Gemini-orange?style=flat)

**Garage Flow App** adalah sistem manajemen pemesanan bengkel otomotif modern yang dirancang untuk mempermudah pelanggan, mekanik, dan admin. Membawa pengalaman digital ke level selanjutnya dengan asisten AI terintegrasi dan visualisasi kendaraan 3D interaktif.

## ✨ Fitur Utama

- **Pemesanan Waktu Nyata (Real-time Scheduling)**: Sistem anti-bentrok untuk mencegah pemesanan ganda di waktu yang sama.
- **Pembayaran Terintegrasi (Midtrans)**: Pembuatan Virtual Account (VA), E-Wallet, dan Qris otomatis menggunakan Midtrans. Dilengkapi sinkronisasi otomatis (*auto-sync*) tanpa perlu menunggu webhook saat di *local development*.
- **Mekanik & Admin Dashboard**: Sistem *Role-Based Access Control* (RBAC) menggunakan Spatie untuk membedakan akses Admin, Mekanik, dan Pelanggan.
- **Asisten Pintar Gemini AI**: Chatbot berbasis *Large Language Model* (LLM) yang membantu pelanggan berkonsultasi tentang keluhan kendaraan sebelum memesan servis.
- **Visualisasi 3D Kendaraan**: Menampilkan model mobil 3D interaktif (*React Three Fiber*) dengan fitur penggantian warna *real-time* langsung di dalam aplikasi.

## 🛠️ Tech Stack

Aplikasi ini mengadopsi arsitektur *Headless* (Backend dan Frontend terpisah):

**Backend:**
- Laravel 11.x
- PHP 8.2+
- MySQL / MariaDB
- Laravel Sanctum (API Authentication)
- Spatie Permission

**Frontend:**
- Expo / React Native (Dapat dikompilasi ke Android, iOS, dan Web)
- Tailwind CSS (via `twrnc`)
- React Three Fiber & Drei (Render 3D .GLB/.GLTF)

**Third-Party Services:**
- **Midtrans Snap API** (Payment Gateway)
- **Google Gemini API** (Generative AI Chat)

---

## 🚀 Panduan Instalasi (Development Lokal)

### Prasyarat
- **Laragon / XAMPP** (PHP 8.2+, MySQL)
- **Node.js** (v18+)
- **Composer**
- Akun Midtrans (Sandbox) & API Key Gemini

---

### 1. Setup Backend (Laravel)

1. Masuk ke folder backend:
   ```bash
   cd mobile-backend
   ```
2. Instal dependensi PHP:
   ```bash
   composer install
   ```
3. Salin konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
4. Buka `.env` dan sesuaikan koneksi database Anda (biasanya `DB_DATABASE=garage_flow_app`). Masukkan juga kunci Midtrans Anda:
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   MIDTRANS_IS_PRODUCTION=false
   ```
5. Generate kunci aplikasi dan jalankan migrasi database beserta seeder dummy-nya:
   ```bash
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```
6. Jalankan server backend (jika tidak menggunakan host virtual Laragon):
   ```bash
   php artisan serve
   ```

---

### 2. Setup Frontend (Expo / React Native)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd mobile-frontend
   ```
2. Instal dependensi Node:
   ```bash
   npm install
   ```
3. Buat file `.env` (pastikan tidak di-*commit* ke Git) dan isi API Endpoint & Key Gemini Anda:
   ```env
   # Contoh jika menggunakan Laragon (ganti dengan host Anda)
   EXPO_PUBLIC_API_URL=http://mobile-project.test/api

   # Gemini API Key untuk AI Chatbot
   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
   ```
4. Jalankan server Expo:
   ```bash
   npm start
   ```
5. Tekan `w` untuk membuka di Web Browser, atau gunakan aplikasi **Expo Go** di HP Anda untuk *scan* QR Code.

---

## 🧑‍💻 Hak Akses Dummy (Untuk Testing)

Karena Anda sudah menjalankan `--seed`, Anda bisa login menggunakan akun dummy berikut:

- **Customer**: `test@example.com` | Password: `password`
- **Mekanik**: `mechanic1@example.com` | Password: `password`
- **Admin**: `admin@example.com` | Password: `password`

---

## 📜 Lisensi
Aplikasi ini dikembangkan sebagai prototipe/demo portofolio dan berlisensi di bawah **MIT License**.
