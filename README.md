# Hari Kecil

Aplikasi web statis untuk catatan harian si kecil. Form berisi delapan isian bebas. Dashboard menampilkan riwayat, kalender, filter tanggal, dan tombol Edit serta Hapus.

## 1. Siapkan Firebase

1. Buka Firebase Console, pilih proyek khusus untuk Hari Kecil, lalu daftarkan aplikasi Web di **Project settings → Your apps**.
2. Buka **Authentication → Sign-in method**, aktifkan **Anonymous**, lalu simpan.
3. Buat **Realtime Database** dalam mode terkunci. Di tab **Rules**, terapkan isi `database.rules.json`, lalu klik **Publish**. Jika proyek sudah memiliki aturan, gabungkan bagian `hariKecil` ke objek `rules` yang ada. Pastikan aturan pada tingkat di atasnya tidak memberi akses baca atau tulis secara umum.
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

## Akses catatan

Aplikasi membuat sesi Firebase anonim secara otomatis. Setiap profil browser mendapat identitasnya sendiri. Catatan tersimpan di Firebase, tetapi aksesnya bergantung pada sesi dari profil browser yang membuatnya. Membuka aplikasi dari browser lain, mengganti domain, memakai mode privat, atau menghapus data situs dapat membuat aplikasi menggunakan identitas baru.
