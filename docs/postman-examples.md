# Contoh Pengujian Postman

## 1. Register
POST `{{baseUrl}}/auth/register`
Content-Type: application/json

```json
{
  "name": "Frans",
  "email": "frans@example.com",
  "password": "password123"
}
```

## 2. Login
POST `{{baseUrl}}/auth/login`

```json
{
  "email": "frans@example.com",
  "password": "password123"
}
```

Salin `token`.

## 3. Create API Key
POST `{{baseUrl}}/api-keys`

Authorization → Bearer Token → isi JWT.

## 4. Get Laptop Data
GET `{{baseUrl}}/api/v1/laptops?limit=10`

Headers:
`X-API-Key: <api_key>`

## 5. Filter
GET `{{baseUrl}}/api/v1/laptops?brand=ASUS&category=Gaming`

## 6. Detail
GET `{{baseUrl}}/api/v1/laptops/1`

## 7. Revoke Key
PATCH `{{baseUrl}}/api-keys/<id>/revoke`

Authorization → Bearer Token.
