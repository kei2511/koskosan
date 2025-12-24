# KosManager - Test Cases Documentation
# =====================================

## TC001: Landing Page
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC001-01 | Verify landing page loads | 1. Buka http://localhost:3000 | Halaman landing terbuka dengan judul "KosManager" |
| TC001-02 | Verify navigation buttons | 1. Cek tombol "Masuk" dan "Daftar Gratis" | Kedua tombol visible dan dapat diklik |
| TC001-03 | Verify hero section | 1. Cek hero text | Terdapat text "Kelola Kos-Kosan Lebih Mudah" |

## TC002: Registration
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC002-01 | Verify registration form | 1. Buka /register | Form dengan field nama, email, password, konfirmasi password |
| TC002-02 | Register dengan data valid | 1. Isi semua field dengan valid 2. Klik Daftar | Redirect ke login dengan pesan sukses |
| TC002-03 | Register dengan email duplicate | 1. Register dengan email yang sudah ada | Error message: "Email sudah terdaftar" |
| TC002-04 | Register dengan password tidak match | 1. Isi password berbeda dari konfirmasi | Error message: "Password tidak sama" |
| TC002-05 | Register dengan field kosong | 1. Klik Daftar tanpa isi field | Validasi error muncul |

## TC003: Login
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC003-01 | Verify login form | 1. Buka /login | Form dengan field email dan password |
| TC003-02 | Login dengan kredensial valid | 1. Isi email dan password valid 2. Klik Masuk | Redirect ke dashboard |
| TC003-03 | Login dengan password salah | 1. Isi email valid, password salah | Error message: "Kredensial tidak valid" |
| TC003-04 | Login dengan email tidak terdaftar | 1. Isi email tidak ada | Error message: "Kredensial tidak valid" |

## TC004: Dashboard
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC004-01 | Verify dashboard access | 1. Login 2. Cek dashboard | Dashboard terbuka dengan stats cards |
| TC004-02 | Verify user greeting | 1. Cek greeting text | "Halo, [nama]! 👋" |
| TC004-03 | Verify stats cards | 1. Cek 4 stats cards | Total Properti, Kamar Terisi, Total Penyewa, Tagihan Belum Lunas |
| TC004-04 | Verify sidebar navigation | 1. Cek sidebar menu | Menu: Dashboard, Properti, Penyewa, Tagihan, Pengaturan |

## TC005: Property Management
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC005-01 | Verify empty state | 1. Buka /dashboard/properties tanpa properti | Pesan "Belum Ada Properti" dengan tombol tambah |
| TC005-02 | Add new property | 1. Klik Tambah Properti 2. Isi form 3. Submit | Properti berhasil ditambahkan, redirect ke list |
| TC005-03 | View property detail | 1. Klik properti dari list | Halaman detail dengan info kamar |
| TC005-04 | Delete property | 1. Klik delete pada properti 2. Konfirmasi | Properti dihapus dari list |

## TC006: Room Management
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC006-01 | Add room to property | 1. Buka detail properti 2. Klik Tambah Kamar 3. Isi form | Kamar berhasil ditambahkan |
| TC006-02 | Verify room status badge | 1. Cek badge pada kamar | Badge: Tersedia/Terisi/Perbaikan |

## TC007: Tenant Management
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC007-01 | Check-in tenant | 1. Buka /dashboard/tenants/new 2. Pilih kamar 3. Isi data 4. Submit | Tenant berhasil check-in, kamar jadi "Terisi" |
| TC007-02 | View tenant list | 1. Buka /dashboard/tenants | Daftar penyewa aktif ditampilkan |

## TC008: Invoice Management
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC008-01 | Create invoice | 1. Buka /dashboard/invoices 2. Klik Buat Tagihan 3. Pilih penyewa 4. Submit | Invoice berhasil dibuat dengan status "Belum Lunas" |
| TC008-02 | Mark invoice as paid | 1. Klik dropdown pada invoice 2. Pilih "Tandai Lunas" | Status berubah jadi "Lunas" |
| TC008-03 | WhatsApp reminder | 1. Klik "Kirim Reminder" | WhatsApp terbuka dengan pesan tagihan |

## TC009: Logout
| ID | Deskripsi | Langkah | Expected Result |
|----|-----------|---------|-----------------|
| TC009-01 | Logout dari aplikasi | 1. Klik avatar 2. Klik "Keluar" | Redirect ke landing page, session cleared |
