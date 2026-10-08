ad# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## ADMIN CARIKOSTKITA

**Versi:** 1.0  
**Produk:** CariKostKita  
**Platform:** Web Admin  
**Target:** Admin/Pengelola CariKostKita

---

## 1. Ringkasan Produk

CariKostKita merupakan platform pencarian kost yang membantu pengguna menemukan tempat kost berdasarkan informasi seperti lokasi, harga, foto, fasilitas, dan detail kost.

Untuk memastikan informasi yang tersedia tetap akurat, aman, dan terkelola dengan baik, diperlukan sebuah **Admin Panel** sebagai pusat pengelolaan seluruh data dan aktivitas platform.

Admin Panel CariKostKita digunakan untuk mengelola data kost, pengguna, pemilik kost, laporan pengguna, iklan/promosi, serta melihat statistik dan perkembangan platform.

---

## 2. Tujuan Admin Panel

Admin Panel dibuat dengan tujuan:

1. Mengelola seluruh data kost yang tersedia di CariKostKita.
2. Memastikan informasi kost yang ditampilkan kepada pengguna valid.
3. Mengelola akun pemilik kost dan pengguna.
4. Menangani laporan dari pengguna mengenai data kost yang tidak sesuai.
5. Mengelola iklan atau promosi yang ditampilkan di aplikasi.
6. Menyediakan statistik dan grafik untuk membantu Admin memantau perkembangan platform.
7. Mencatat aktivitas Admin untuk menjaga keamanan dan transparansi sistem.

---

## 3. Role Pengguna

### Admin

Admin merupakan pengguna yang memiliki akses terhadap sistem pengelolaan CariKostKita.

Admin dapat:

- Melihat dashboard.
- Mengelola data kost.
- Memverifikasi data kost.
- Mengelola pemilik kost.
- Mengelola pengguna.
- Menangani laporan.
- Mengelola iklan.
- Melihat statistik.
- Melihat riwayat aktivitas.
- Mengelola profil Admin.

---

# 4. Dashboard Admin

Dashboard merupakan halaman utama setelah Admin berhasil login.

Dashboard menampilkan ringkasan kondisi platform dalam bentuk **card statistik, tabel aktivitas, dan chart**.

### Statistik utama

Dashboard menampilkan:

- Total Kost.
- Kost Aktif.
- Kost Menunggu Verifikasi.
- Kost Ditolak/Nonaktif.
- Total Pemilik Kost.
- Total Pengguna.
- Total Laporan.
- Total Iklan Aktif.

### Data visualisasi

Dashboard menyediakan beberapa chart:

**Chart jumlah kost berdasarkan status**
- Aktif.
- Menunggu verifikasi.
- Ditolak.
- Nonaktif.

**Chart pertumbuhan kost**
- Menampilkan jumlah kost yang ditambahkan berdasarkan periode waktu.
- Data dapat dikelompokkan berdasarkan bulan.

**Chart kost berdasarkan lokasi**
- Menampilkan jumlah kost berdasarkan kecamatan atau wilayah.

**Chart status laporan**
- Laporan baru.
- Sedang diproses.
- Selesai.
- Ditolak.

**Chart pertumbuhan pengguna**
- Menampilkan jumlah pengguna baru berdasarkan periode.

**Chart pertumbuhan pemilik kost**
- Menampilkan jumlah pemilik kost baru berdasarkan periode.

Dashboard harus menggunakan data aktual dari database dan tidak menggunakan angka statis.

---

# 5. Manajemen Data Kost

Admin dapat mengelola seluruh data kost yang terdapat di dalam sistem.

### Data kost

Informasi yang dapat dikelola meliputi:

- Nama kost.
- Foto kost.
- Deskripsi.
- Harga sewa.
- Alamat.
- Lokasi/koordinat.
- Kecamatan.
- Fasilitas.
- Informasi kamar.
- Data pemilik.
- Status kost.
- Tanggal dibuat.
- Tanggal diperbarui.

### Fitur

Admin dapat:

- Melihat daftar kost.
- Melihat detail kost.
- Mencari kost.
- Memfilter kost.
- Menambahkan kost.
- Mengedit data kost.
- Menghapus kost.
- Mengaktifkan kost.
- Menonaktifkan kost.
- Memverifikasi kost.
- Menolak pengajuan kost.

### Status kost

Kost memiliki beberapa status:

- **Menunggu Verifikasi**
- **Aktif**
- **Ditolak**
- **Nonaktif**

Kost yang berstatus **Aktif** dapat ditampilkan kepada pengguna aplikasi.

Kost yang belum diverifikasi tidak boleh ditampilkan sebagai kost aktif kepada pengguna.

---

# 6. Manajemen Pemilik Kost

Admin dapat mengelola data pemilik kost yang terdaftar.

### Data pemilik

- Nama.
- Nomor telepon.
- Email.
- Foto profil.
- Jumlah kost.
- Status akun.
- Tanggal pendaftaran.

### Fitur

Admin dapat:

- Melihat daftar pemilik.
- Mencari pemilik.
- Melihat detail pemilik.
- Melihat daftar kost milik pemilik.
- Mengaktifkan akun.
- Menonaktifkan akun.

Jika akun pemilik dinonaktifkan, kost yang dikelola oleh pemilik tersebut dapat ditinjau kembali oleh Admin dan dinonaktifkan apabila diperlukan.

---

# 7. Manajemen Pengguna

Admin dapat melihat dan mengelola pengguna yang menggunakan CariKostKita sebagai pencari kost.

### Data pengguna

- Nama.
- Email.
- Nomor telepon.
- Foto profil.
- Status akun.
- Tanggal terdaftar.

### Fitur

Admin dapat:

- Melihat daftar pengguna.
- Mencari pengguna.
- Melihat detail pengguna.
- Mengaktifkan akun.
- Menonaktifkan akun.

Admin tidak dapat mengubah informasi pribadi pengguna tanpa alasan atau kebutuhan administratif yang valid.

---

# 8. Manajemen Laporan Kost

CariKostKita menyediakan fitur **Lapor Kost** agar pengguna dapat melaporkan informasi kost yang dianggap tidak sesuai.

Laporan dapat berupa:

- Foto tidak sesuai.
- Harga tidak sesuai.
- Lokasi tidak sesuai.
- Informasi kost tidak sesuai.
- Kost sudah tidak tersedia.
- Pelanggaran lainnya.

### Data laporan

- ID laporan.
- Kost yang dilaporkan.
- Pengguna yang melapor.
- Jenis laporan.
- Deskripsi laporan.
- Bukti/foto jika tersedia.
- Tanggal laporan.
- Status laporan.
- Tindakan Admin.

### Status laporan

- **Baru**
- **Diproses**
- **Selesai**
- **Ditolak**

### Alur

Pengguna mengirim laporan → laporan masuk ke Admin → Admin memeriksa laporan → Admin menentukan tindakan → status laporan diperbarui.

Tindakan Admin dapat berupa:

- Tidak ada tindakan.
- Meminta pemilik memperbaiki informasi.
- Memperbaiki data kost.
- Menonaktifkan kost.
- Menolak laporan jika tidak terbukti.

---

# 9. Manajemen Iklan & Promosi

Admin memiliki fitur untuk mengelola iklan yang ditampilkan kepada pengguna aplikasi.

Iklan dapat berbentuk:

- Pop-up.
- Banner.
- Promo kost.
- Promosi layanan atau informasi tertentu.

### Data iklan

Setiap iklan memiliki:

- Judul iklan.
- Gambar/banner.
- Deskripsi.
- Link tujuan.
- Tipe iklan.
- Posisi iklan.
- Tanggal mulai tayang.
- Tanggal berakhir.
- Status iklan.

### Fitur

Admin dapat:

- Menambahkan iklan.
- Mengedit iklan.
- Menghapus iklan.
- Mengaktifkan iklan.
- Menonaktifkan iklan.
- Menentukan periode tayang.
- Menentukan jenis/posisi iklan.
- Melihat performa iklan.

### Contoh tampilan pop-up

Iklan dapat muncul ketika pengguna membuka aplikasi:

**Gambar iklan → Judul → Deskripsi → Tombol aksi → Tutup**

Ketika pengguna menekan tombol atau gambar iklan, sistem dapat mengarahkan pengguna ke halaman tertentu dalam aplikasi atau link yang telah ditentukan Admin.

### Statistik iklan

Admin dapat melihat:

- Jumlah tayangan/impression.
- Jumlah klik.
- CTR (Click Through Rate).
- Iklan paling banyak dilihat.
- Iklan paling banyak diklik.

Data performa iklan dapat ditampilkan dalam bentuk chart.

---

# 10. Statistik & Analitik

Admin dapat melihat perkembangan CariKostKita melalui halaman statistik.

Data yang tersedia meliputi:

- Total pengguna.
- Total pemilik.
- Total kost.
- Kost aktif.
- Kost berdasarkan wilayah.
- Kost berdasarkan status.
- Jumlah laporan.
- Jumlah iklan.
- Impression iklan.
- Klik iklan.
- Pertumbuhan pengguna.
- Pertumbuhan pemilik.
- Pertumbuhan kost.

Admin dapat menentukan periode data seperti:

- Harian.
- Mingguan.
- Bulanan.
- Tahunan.

Data statistik harus berasal dari database dan diperbarui sesuai data terbaru.

---

# 11. Audit Log

Sistem mencatat aktivitas penting yang dilakukan oleh Admin.

Informasi yang dicatat:

- Admin yang melakukan aktivitas.
- Jenis aktivitas.
- Data yang dipengaruhi.
- Waktu aktivitas.
- Status aktivitas.

Contoh aktivitas:

> Admin mengubah status Kost Mawar dari "Menunggu Verifikasi" menjadi "Aktif".

> Admin menghapus iklan Promo Kost Pekanbaru.

> Admin menonaktifkan akun pemilik kost.

Audit Log digunakan untuk membantu keamanan dan pelacakan perubahan data.

---

# 12. Authentication & Security

Admin wajib melakukan login sebelum mengakses Admin Panel.

### Fitur keamanan

- Login Admin.
- Logout.
- Session management.
- Proteksi halaman Admin.
- Role-based access.
- Password terenkripsi.
- Validasi input.
- Pembatasan akses terhadap halaman administratif.

Pengguna biasa tidak dapat mengakses halaman Admin.

---

# 13. Pengaturan Admin

Admin memiliki halaman pengaturan akun.

Fitur:

- Melihat profil.
- Mengubah nama.
- Mengubah email.
- Mengubah password.
- Logout.

Perubahan password harus melalui proses validasi keamanan.

---

# 14. Struktur Navigasi Admin

Struktur navigasi Admin:

```text
Admin CariKostKita
│
├── Dashboard
│   ├── Statistik
│   ├── Chart
│   └── Aktivitas Terbaru
│
├── Manajemen Kost
│   ├── Semua Kost
│   ├── Menunggu Verifikasi
│   ├── Aktif
│   └── Ditolak / Nonaktif
│
├── Pemilik Kost
│
├── Pengguna
│
├── Laporan Kost
│
├── Manajemen Iklan
│   ├── Daftar Iklan
│   ├── Tambah Iklan
│   └── Statistik Iklan
│
├── Statistik & Analitik
│
├── Audit Log
│
└── Pengaturan
```

---

# 15. Kebutuhan UI/UX

Admin Panel harus memiliki tampilan yang sederhana dan mudah digunakan.

Komponen utama:

- Sidebar navigation.
- Navbar.
- Dashboard cards.
- Data table.
- Search.
- Filter.
- Pagination.
- Form.
- Modal konfirmasi.
- Status badge.
- Chart.
- Notification/toast.
- Empty state.
- Loading state.
- Error state.

Tindakan yang bersifat permanen seperti menghapus data harus menggunakan **confirmation dialog**.

Contoh:

> "Apakah Anda yakin ingin menghapus data kost ini?"

---

# 16. Validasi Data

Sistem harus melakukan validasi sebelum data disimpan.

Contoh:

- Nama kost wajib diisi.
- Harga harus berupa angka.
- Alamat wajib diisi.
- Lokasi harus valid.
- Foto harus menggunakan format yang didukung.
- Email harus memiliki format valid.
- Data wajib tidak boleh kosong.
- Tanggal akhir iklan tidak boleh lebih awal dari tanggal mulai.
- Iklan yang sudah melewati tanggal berakhir otomatis tidak lagi ditampilkan kepada pengguna.

---

# 17. Requirement Data & Chart

Setiap chart pada Admin Panel harus mengambil data dari database.

| Chart | Sumber Data | Pengelompokan |
|---|---|---|
| Kost berdasarkan status | Data Kost | Status |
| Pertumbuhan kost | Data Kost | Bulan |
| Kost berdasarkan wilayah | Data Kost | Kecamatan |
| Status laporan | Data Laporan | Status |
| Pertumbuhan pengguna | Data Pengguna | Bulan |
| Pertumbuhan pemilik | Data Pemilik | Bulan |
| Performa iklan | Data Iklan | Hari/Bulan |

Chart tidak boleh menggunakan data dummy ketika sistem sudah memiliki data aktual.

---

# 18. Acceptance Criteria

Admin Panel dianggap memenuhi kebutuhan apabila:

1. Admin dapat login dan logout.
2. Admin dapat mengakses Dashboard.
3. Dashboard menampilkan statistik berdasarkan data aktual.
4. Dashboard menyediakan chart untuk data utama.
5. Admin dapat mengelola data kost.
6. Admin dapat melakukan verifikasi kost.
7. Admin dapat mengelola data pemilik.
8. Admin dapat mengelola data pengguna.
9. Admin dapat menerima dan memproses laporan kost.
10. Admin dapat membuat dan mengelola iklan.
11. Iklan aktif dapat ditampilkan kepada pengguna berdasarkan periode tayang.
12. Sistem dapat mencatat impression dan klik iklan.
13. Admin dapat melihat statistik iklan.
14. Sistem mencatat aktivitas penting Admin.
15. Halaman Admin hanya dapat diakses oleh pengguna dengan hak akses Admin.
16. Sistem memberikan validasi terhadap data yang dimasukkan.
17. Data yang telah dihapus atau diubah tidak menyebabkan kerusakan pada data terkait.
18. Admin mendapatkan feedback ketika suatu proses berhasil atau gagal.

---

# 19. Tujuan Akhir

Admin Panel CariKostKita diharapkan menjadi pusat pengelolaan seluruh platform sehingga Admin dapat menjaga kualitas informasi kost, mengawasi pengguna dan pemilik, menangani laporan, mengelola promosi, serta memantau perkembangan platform melalui statistik dan visualisasi data.

Dengan adanya Admin Panel, CariKostKita tidak hanya berfungsi sebagai aplikasi pencarian kost, tetapi juga memiliki sistem pengelolaan data yang terstruktur, terkontrol, dan dapat dikembangkan untuk kebutuhan platform di masa depan.
