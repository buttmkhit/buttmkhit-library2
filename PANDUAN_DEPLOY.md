# 📚 BUTTMKHIT e-Library v2.0 — Panduan Deploy

## 📋 Tentang Aplikasi

**BUTTMKHIT e-Library** adalah sistem manajemen repositori ilmiah berbasis web untuk Balai Uji Terap Teknik dan Metode Karantina Hewan, Ikan, dan Tumbuhan.

**Stack Teknologi:**
- **Frontend:** React 19 + TypeScript + Tailwind CSS + Lucide Icons
- **Backend:** Node.js + Express.js
- **Database:** SQLite (via better-sqlite3) — _tidak perlu install database server_
- **Build Tool:** Vite
- **File Storage:** Lokal di folder `public/uploads/`

---

## 🔐 Akun Default

| NIP / Username | Password | Role |
|---|---|---|
| `admin` | `admin` | Administrator |
| `humas` | `humas_buttmkhit` | Administrator |

> ⚠️ **PENTING:** Ganti password admin segera setelah deploy pertama!

---

## 🖥️ Opsi 1: Deploy Lokal (Development/Testing)

### Prasyarat
- Node.js versi **18 atau lebih baru** ([download](https://nodejs.org))
- npm (sudah termasuk bersama Node.js)

### Langkah-langkah

```bash
# 1. Ekstrak file zip ke folder pilihan Anda
unzip buttmkhit-e-library.zip -d buttmkhit-e-library
cd buttmkhit-e-library

# 2. Install semua dependensi
npm install

# 3. Jalankan server development
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 🌐 Opsi 2: Deploy ke VPS/Server (Production)

### Prasyarat Server
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js 18+
- Nginx (sebagai reverse proxy)
- PM2 (process manager)

### Langkah 1 — Install Node.js di Server

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # pastikan v18+
```

### Langkah 2 — Upload & Persiapkan Aplikasi

```bash
# Upload file ke server (dari komputer lokal Anda):
scp buttmkhit-e-library.zip user@IP_SERVER:/var/www/

# Di server:
cd /var/www/
unzip buttmkhit-e-library.zip -d elibrary
cd elibrary
npm install
```

### Langkah 3 — Build Production

```bash
# Build frontend
npm run build

# Test jalankan production server
npm run start
# Akses http://IP_SERVER:3000 — pastikan berjalan

# Ctrl+C untuk hentikan
```

### Langkah 4 — Setup PM2 (Auto-restart)

```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan aplikasi dengan PM2
pm2 start "npm run start" --name buttmkhit-elibrary

# Simpan konfigurasi PM2
pm2 save

# Setup agar PM2 otomatis start saat server reboot
pm2 startup
# (ikuti perintah yang ditampilkan)

# Cek status
pm2 status
pm2 logs buttmkhit-elibrary
```

### Langkah 5 — Setup Nginx (Reverse Proxy)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/elibrary
```

Isi konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name DOMAIN_ANDA.com;   # atau IP server jika tanpa domain

    # Batas ukuran upload (sesuaikan kebutuhan)
    client_max_body_size 60M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve file uploads langsung via Nginx (lebih efisien)
    location /uploads/ {
        alias /var/www/elibrary/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/elibrary /etc/nginx/sites-enabled/
sudo nginx -t          # test konfigurasi
sudo systemctl restart nginx
```

### Langkah 6 — HTTPS dengan SSL (Opsional tapi Disarankan)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d DOMAIN_ANDA.com
```

---

## ☁️ Opsi 3: Deploy ke Railway (Paling Mudah)

Railway adalah platform cloud yang sangat mudah digunakan.

### Langkah-langkah

1. Daftar akun gratis di [railway.app](https://railway.app)
2. Klik **"New Project"** → **"Deploy from GitHub"**
3. Push kode ke repository GitHub Anda terlebih dahulu:
   ```bash
   git init
   git add .
   git commit -m "Initial commit BUTTMKHIT e-Library"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
4. Di Railway, pilih repo tersebut
5. Railway akan otomatis mendeteksi Node.js
6. Tambahkan variabel lingkungan:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
7. Deploy!

> **Catatan:** Pada Railway plan gratis, file upload tersimpan sementara. Untuk penyimpanan permanen, upgrade ke paid plan atau gunakan storage eksternal.

---

## 🐳 Opsi 4: Deploy dengan Docker

Buat file `Dockerfile` di root proyek:

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN mkdir -p public/uploads

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
```

```bash
# Build image
docker build -t buttmkhit-elibrary .

# Jalankan container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/database.sqlite \
  -v $(pwd)/uploads:/app/public/uploads \
  --name elibrary \
  buttmkhit-elibrary
```

---

## 🗄️ Manajemen Database

Database SQLite tersimpan di file `database.sqlite` di root proyek.

### Backup Database

```bash
# Backup manual
cp database.sqlite database.backup-$(date +%Y%m%d).sqlite

# Backup otomatis harian (tambahkan ke crontab)
crontab -e
# Tambahkan baris ini:
0 2 * * * cp /var/www/elibrary/database.sqlite /backup/elibrary-$(date +\%Y\%m\%d).sqlite
```

### Reset Database (Hapus Semua Data)

```bash
rm database.sqlite
# Restart server — database baru akan dibuat otomatis dengan data contoh
npm run start
```

### Lihat Isi Database

```bash
# Install sqlite3 CLI
sudo apt install sqlite3

# Buka database
sqlite3 database.sqlite

# Perintah berguna:
.tables                              -- lihat semua tabel
SELECT * FROM documents;             -- lihat semua dokumen
SELECT * FROM profiles;              -- lihat semua pengguna
SELECT COUNT(*) FROM documents;      -- hitung dokumen
.quit
```

---

## 📁 Struktur Folder

```
buttmkhit-e-library/
├── src/
│   ├── App.tsx          ← Komponen React utama (frontend)
│   ├── main.tsx         ← Entry point React
│   └── index.css        ← Global styles
├── public/
│   └── uploads/         ← File PDF yang diunggah (dibuat otomatis)
├── dist/                ← Hasil build production (dibuat saat `npm run build`)
├── server.ts            ← Server Express + API + SQLite
├── database.sqlite      ← Database (dibuat otomatis)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── PANDUAN_DEPLOY.md    ← File ini
```

---

## 🔌 Endpoint API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/documents` | Ambil semua dokumen (mendukung filter: `?tag=&type=&q=`) |
| POST | `/api/documents` | Tambah dokumen baru |
| PUT | `/api/documents/:id` | Update dokumen |
| DELETE | `/api/documents/:id` | Hapus dokumen |
| PATCH | `/api/documents/:id/track` | Catat view/download |
| GET | `/api/stats` | Statistik repositori |
| POST | `/api/login` | Login pengguna |
| POST | `/api/register` | Registrasi pengguna |
| GET | `/api/users` | Daftar semua pengguna (admin) |
| DELETE | `/api/users/:nip` | Hapus pengguna (admin) |
| POST | `/api/upload` | Upload file PDF |

---

## ⚠️ Catatan Keamanan untuk Production

1. **Ganti password admin** segera setelah deploy pertama
2. **Nonaktifkan registrasi publik** jika tidak diperlukan (edit di `server.ts`)
3. **Backup database** secara rutin
4. **Gunakan HTTPS** (SSL) untuk melindungi data login
5. **Batasi akses** ke endpoint `/api/users` hanya untuk admin (sudah diimplementasi di frontend, sebaiknya juga di backend)
6. Pertimbangkan **pindah ke PostgreSQL** jika data melebihi 10.000 dokumen

---

## 🔧 Troubleshooting

**Port 3000 sudah digunakan?**
```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000
# Ganti port di server.ts: const PORT = 4000;
```

**Error "better-sqlite3 tidak bisa dikompilasi"?**
```bash
sudo apt install build-essential python3 -y
npm rebuild better-sqlite3
```

**File upload tidak muncul?**
```bash
# Pastikan folder uploads ada dan writable
mkdir -p public/uploads
chmod 755 public/uploads
```

**PM2 tidak bisa start?**
```bash
pm2 logs buttmkhit-elibrary --lines 50
```

---

## 📞 Informasi Kontak

**BUTTMKHIT** — Balai Uji Terap Teknik dan Metode Karantina Hewan, Ikan, dan Tumbuhan  
Badan Karantina Indonesia  
Website: [karantinaindonesia.go.id](https://karantinaindonesia.go.id)

---

*Dokumen ini dibuat untuk BUTTMKHIT e-Library v2.0*
