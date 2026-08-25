# CRUD LaptopHub

Semua endpoint CRUD membutuhkan JWT Bearer Token hasil `POST /auth/login`.

- GET `/admin/laptops`
- GET `/admin/laptops/:id`
- POST `/admin/laptops`
- PUT `/admin/laptops/:id`
- DELETE `/admin/laptops/:id`

Contoh body POST/PUT:

```json
{
  "sku": "LTP-NEW-061",
  "name": "LaptopHub Pro 14",
  "brand": "LaptopHub",
  "model": "Pro 14",
  "category": "Business",
  "price": 14999000,
  "stock": 10,
  "rating": 4.8,
  "release_year": 2026,
  "cpu": "Intel Core Ultra 7 258V",
  "gpu": "Intel Arc Graphics",
  "ram_gb": 32,
  "storage_gb": 1024,
  "storage_type": "NVMe SSD",
  "display_size": 14,
  "display_resolution": "2880x1800",
  "operating_system": "Windows 11 Pro",
  "weight_kg": 1.35,
  "color": "Silver",
  "specs": { "wifi": "Wi-Fi 7", "bluetooth": "5.4" },
  "image_url": "https://example.com/laptop.jpg"
}
```
