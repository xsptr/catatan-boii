# Hari Kecil

Aplikasi web statis untuk catatan harian. Semua perangkat yang membuka situs menggunakan Firebase Realtime Database yang sama. Riwayat dibaca dari `/hariKecil/catatan`, dan satu catatan disimpan per tanggal pada `/hariKecil/catatan/YYYY-MM-DD`.

## Konfigurasi dan pemasangan

1. Buka Firebase Console dan pilih proyek yang akan dipakai. Pastikan aplikasi Web sudah terdaftar di **Project settings → Your apps**.
2. Aktifkan **Authentication → Sign-in method → Anonymous**. Sesi ini dibuat otomatis ketika situs dibuka.
3. Di **Realtime Database → Rules**, terapkan `database.rules.json` lalu klik **Publish**. Jika database juga dipakai aplikasi lain, gabungkan properti `catatan` di bawah `rules.hariKecil` dengan aturan yang sudah ada. Periksa izin di tingkat induk karena izin induk juga berlaku pada node di bawahnya.
4. Isi `firebase-config.js` di server satu kali. Jika file tersebut sudah terisi, gunakan konfigurasi yang sudah ada. Sertakan `databaseURL` dari halaman Realtime Database.

   ```js
   export default {
     apiKey: "API_KEY_WEB_APP",
     authDomain: "ID_PROYEK.firebaseapp.com",
     databaseURL: "https://URL-REALTIME-DATABASE-ANDA",
     projectId: "ID_PROYEK",
     appId: "APP_ID_WEB"
   };
   ```

5. Unggah isi folder `Hari-Kecil` ke direktori web yang sama. Buka alamat HTTPS situs dari dua perangkat. Buat atau edit catatan uji di satu perangkat dan periksa perangkat kedua.

Semua pengunjung dapat membaca, menambah, mengedit, dan menghapus catatan. Aturan memungkinkan sesi Firebase anonim dari proyek yang sama, termasuk sesi yang dibuat oleh klien lain. Domain situs sendiri tidak membatasi akses ke catatan.

## Memindahkan catatan dari versi sebelumnya

Jika sudah ada data pada `/hariKecil/<UID>` atau `/hariKecilBersama/<key>`, salin catatan yang ingin dipakai ke `/hariKecil/catatan`.

1. Di tab **Data** pada Firebase Console, pilih node lama yang langsung berisi tanggal seperti `2026-11-17`, lalu pilih **Export JSON**.
2. Jika `/hariKecil/catatan` kosong, impor objek bertanggal itu di lokasi tersebut. Bila folder `catatan` belum tersedia, impor objek `{ "catatan": { ... } }` pada node `hariKecil` hanya jika node itu belum berisi data. Untuk node `hariKecil` yang sudah berisi data, buat atau tambahkan catatan satu per satu di lokasi tujuan.
3. Jika tujuan sudah berisi catatan, periksa tanggal yang sama dan gabungkan catatannya sebelum mengimpor. **Import JSON dapat mengganti isi node tujuan.**
4. Buka dashboard dari dua perangkat untuk memastikan tanggal dan isi catatan sudah sesuai.
