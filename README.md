# Nenda - Panduan Setup Server Lokal

## Prerequisites

1. Python

2. XAMPP

## Langkah 1: Menyiapkan Database (MySQL)

1. Buka **XAMPP Control Panel** di Windows Anda.
2. Klik tombol **Start** pada modul **Apache** dan **MySQL** hingga indikator statusnya berwarna hijau.
3. Buka browser web Anda (misalnya Chrome atau Edge) dan akses **phpMyAdmin** melalui URL: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/).
4. Buat database baru:
   - Klik menu **New** di panel sebelah kiri phpMyAdmin.
   - Masukkan nama database: `nenda_db`.
   - Pilih collation default (misalnya `utf8mb4_general_ci`) dan klik tombol **Create**.
5. Impor skema database:
   - Klik database `nenda_db` yang baru saja Anda buat di panel kiri.
   - Klik tab **Import** di menu navigasi bagian atas.
   - Pada bagian **File to import**, klik **Choose File** (Pilih File) dan arahkan ke file database proyek: `database/nenda_database.sql`.
   - Scroll ke bawah halaman dan klik tombol **Import** (atau **Go**).
   - Tunggu hingga proses impor selesai dan muncul pesan sukses bahwa seluruh tabel database berhasil dibuat.

## Langkah 2: Konfigurasi Environment Variables

1. Masuk ke folder proyek `backend/`.
2. Buat file bernama `.env`.
3. Buka file `.env`
4. Ubah config:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=nenda_db
   # DB_UNIX_SOCKET=/opt/lampp/var/mysql/mysql.sock (Komentari atau hapus baris ini di Windows)
   ```

## Langkah 3: Setup Virtual Environment dan Install Dependensi Python

1. Buka terminal
2. Masuk ke dalam folder `backend/` proyek ini. Contoh perintah:
   ```cmd
   cd path\to\Nenda\backend
   ```
3. Buat Virtual Environment:
   ```cmd
   python -m venv env
   ```
4. Aktifkan Virtual Environment yang baru dibuat:
   - Jika menggunakan **Command Prompt (CMD)**:
     ```cmd
     env\Scripts\activate
     ```
   - Jika menggunakan **PowerShell**:
     ```powershell
     .\env\Scripts\activate
     ```
5. Setelah Virtual Environment aktif, instal seluruh dependensi yang tertera di `requirements.txt`:
   ```cmd
   pip install -r requirements.txt
   ```

## Langkah 4: Menjalankan Server Aplikasi

1. Pastikan Anda masih berada di folder `backend/` dengan Virtual Environment yang aktif.
2. Jalankan server dengan mengeksekusi script python:
   ```cmd
   python server.py
   ```

## Troubleshooting (Penyelesaian Masalah)

- **Error: `Database connection error` saat menjalankan server**
  Pastikan modul MySQL di XAMPP Control Panel sudah dalam keadaan aktif (berwarna hijau) dan konfigurasi file `.env` Anda sudah benar (terutama username `root` dan password yang kosong).
- **Error: `Scripts cannot be loaded...` saat mengaktifkan virtual environment di PowerShell**
  Gunakan Command Prompt (CMD) sebagai terminal alternatif, atau jalankan perintah berikut di PowerShell Anda sebelum mengaktifkan virtual env:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
  ```
