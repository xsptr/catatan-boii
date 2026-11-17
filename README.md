# Hari Kecil

Aplikasi web statis untuk catatan harian si kecil. Form berisi delapan isian bebas. Dashboard menampilkan riwayat, kalender, filter tanggal, dan tombol Edit serta Hapus.

## 1. Siapkan Firebase

1. Buka Firebase Console, pilih proyek khusus untuk Hari Kecil, lalu daftarkan aplikasi Web di **Project settings → Your apps**.
2. Buka **Authentication → Sign-in method**, aktifkan **Anonymous**, lalu simpan.
3. Buat **Realtime Database** dalam mode terkunci. Di tab **Rules**, terapkan isi `database.rules.json`, lalu klik **Publish**. Jika proyek sudah memiliki aturan, gabungkan bagian `hariKecil` dan `hariKecilBersama` ke objek `rules` yang ada. Pastikan aturan pada tingkat di atasnya tidak memberi akses baca atau tulis secara umum.
4. Buka `firebase-config.js`. Ganti `null` dengan objek konfigurasi aplikasi Web dari Firebase. Sertakan `databaseURL` yang disalin dari halaman Realtime Database. Contoh bentuk file:

   ```js
   export default {
     apiKey: "API_KEY_WEB_APP",
     authDomain: "ID_PROYEK.firebaseapp.com",
     databaseURL: "https://URL-REALTIME-DATABASE-ANDA",
     projectId: "ID_PROYEK",
     appId: "APP_ID_WEB"
   };
   ```

   Gunakan nilai proyek yang sebenarnya. Anda juga bisa mengisi konfigurasi lewat menu **Pengaturan** di aplikasi. Konfigurasi dari menu tersebut tersimpan pada profil browser yang mengisinya.

## 2. Unggah ke server

1. Ekstrak ZIP, lalu unggah isi folder `Hari-Kecil` ke direktori yang akan dilayani server. Contoh lokasi adalah `public_html/hari-kecil/`. Letakkan semua file aplikasi pada direktori yang sama.
2. Buka alamat HTTPS direktori tersebut, misalnya `https://domain-anda.id/hari-kecil/`. Aplikasi dapat dilayani sebagai file statis dan memuat SDK Firebase melalui internet.
3. Tunggu status **Firebase terhubung**. Buat satu catatan uji, muat ulang halaman, lalu periksa filter tanggal serta tombol **Edit** dan **Hapus**.

## Membuka jurnal yang sama dari beberapa perangkat

1. Isi `firebase-config.js` di server satu kali. Unggah file aplikasi dan aturan versi ini. Jika aplikasi sudah dipasang, pertahankan isi konfigurasi Firebase yang sudah dipakai dan terapkan aturan baru dari `database.rules.json`.
2. Buka aplikasi pada perangkat utama. Pilih **Buat tautan pribadi**. Catatan yang sudah ada di browser ini akan disalin ke jurnal bersama.
3. Salin tautan yang ditampilkan dan buka di perangkat lain. Setelah itu, perangkat tersebut bisa kembali menggunakan alamat web biasa selama data situsnya masih tersimpan. Simpan tautan agar akses bisa dipulihkan saat berganti browser atau setelah data situs dihapus.
4. Coba tambah atau edit satu catatan uji, lalu periksa perubahan tersebut di perangkat lain.

Siapa pun yang memegang tautan pribadi dapat membaca, mengedit, dan menghapus catatan jurnal tersebut. Bagikan hanya kepada orang yang Anda percayai. Tautan berisi kunci acak yang berbeda untuk tiap jurnal. Jurnal menggunakan proyek Firebase dan Realtime Database yang sama di semua perangkat.
