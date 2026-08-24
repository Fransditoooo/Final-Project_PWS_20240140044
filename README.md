# LaptopHub API — SaaS Toko Laptop

LaptopHub API adalah contoh **Software as a Service (SaaS)** untuk menyediakan data katalog laptop kepada aplikasi lain.

## Stack
- Express.js
- PostgreSQL / Supabase
- JWT untuk autentikasi pengguna
- API Key untuk autentikasi konsumen API
- Vercel untuk deployment

## Fitur
1. Register & login dengan JWT.
2. User dapat membuat beberapa API Key.
3. API Key dapat dicabut/revoke.
4. Endpoint katalog laptop hanya dapat diakses dengan API Key.
5. Search, filter brand/category, pagination.
6. Endpoint detail laptop.
7. Statistik dashboard sederhana.
8. 60 data laptop dengan spesifikasi kompleks JSONB.
9. Request count dan last used API Key.
10. Siap deploy ke Vercel.

## 1. Jalankan lokal

```bash
npm install
```

Salin `.env.example` menjadi `.env`, lalu isi:

```env
DATABASE_URL=...
JWT_SECRET=...
API_KEY_PEPPER=...
```

Di Supabase SQL Editor jalankan:
1. `sql/schema.sql`
2. `sql/seed.sql`

Lalu:

```bash
npm run dev
```

Server: `http://localhost:3000`

## 2. Alur penggunaan

### Register
`POST /auth/register`

```json
{
  "name": "Frans",
  "email": "frans@example.com",
  "password": "password123"
}
```

### Login
`POST /auth/login`

```json
{
  "email": "frans@example.com",
  "password": "password123"
}
```

Simpan `token` hasil login.

### Buat API Key
`POST /api-keys`

Header:
```text
Authorization: Bearer JWT_TOKEN
```

Body:
```json
{
  "name": "Website Toko Saya"
}
```

Response akan memberikan `api_key`. Simpan karena raw key hanya dikirim saat dibuat.

### Konsumsi API
`GET /api/v1/laptops`

Header:
```text
X-API-Key: ltk_xxxxxxxxx
```

Contoh:

```text
GET /api/v1/laptops?limit=10&offset=0
GET /api/v1/laptops?search=gaming
GET /api/v1/laptops?brand=ASUS
GET /api/v1/laptops?category=Gaming
GET /api/v1/laptops/1
GET /api/v1/laptops/brands
```

## 3. Deploy ke Vercel

1. Push project ke GitHub.
2. Login ke Vercel.
3. Import repository.
4. Framework preset: Other.
5. Tambahkan Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `API_KEY_PEPPER`
6. Deploy.
7. Tes:
   - `https://DOMAIN-VERCEL.vercel.app/health`
   - register/login
   - buat API key
   - panggil `/api/v1/laptops`

## 4. Catatan Supabase

Gunakan connection string PostgreSQL dari Supabase. Untuk deployment Vercel, gunakan connection string yang sesuai dengan pooler/connection pooling Supabase jika tersedia di project Anda.

Jangan pernah commit `.env` atau password database ke GitHub.

## 5. Struktur

```text
laptop-api-saas/
├── src/
│   ├── middleware/
│   │   ├── apiKey.js
│   │   └── auth.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── apiKeys.js
│   │   ├── auth.js
│   │   └── laptops.js
│   ├── utils/
│   │   └── security.js
│   ├── app.js
│   ├── db.js
│   ├── seed.js
│   └── server.js
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

## 6. Nilai tugas yang dapat ditunjukkan

- **JWT:** login/register dan endpoint dashboard/API Key management.
- **API Key:** akses data laptop.
- **SaaS:** aplikasi lain dapat menjadi konsumen API dengan key masing-masing.
- **Database:** users, api_keys, laptops.
- **Kompleksitas:** 60 record, relasi user → api_keys, JSONB specs, pagination, search, filter, stock, rating, harga, CPU, GPU, RAM, storage, display, OS, dan metadata.
