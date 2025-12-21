# LoginPage API Integration Testing Guide

## 📋 Overview

LoginPage.tsx sudah diintegrasikan dengan backend API menggunakan `useAuth` dan `useOutlet` hooks dari `src/hooks/index.ts`.

## 🔧 Setup Sebelum Testing

### 1. Pastikan Environment Variables Sudah Benar

**File: `.env` di root project**

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### 2. Backend Running

Pastikan backend server sudah berjalan:

```bash
# Di terminal backend
npm run dev
# atau
node server.js
```

Backend harus running di `http://localhost:5000`

### 3. Frontend Running

```bash
# Di terminal frontend
npm start
```

Frontend akan running di `http://localhost:3000`

## 🧪 Testing LoginPage Integration

### Test 1: Login dengan Email dan Password

**Langkah:**
1. Buka `http://localhost:3000` di browser
2. Masukkan email: `fikri@madura.com`
3. Masukkan password: `fikri123`
4. Klik tombol "Masuk"

**Expected Result:**
- ✅ Tombol "Masuk" berubah menjadi "Masuk..." (loading state)
- ✅ Text "Menghubungi server..." muncul
- ✅ Setelah berhasil, halaman redirect ke dashboard (HomePage atau OwnerDashboard)
- ✅ User data dan outlets disimpan ke state

**Jika Error:**
- ❌ Cek console browser (F12 → Console) untuk error message
- ❌ Cek apakah backend sudah running
- ❌ Cek REACT_APP_API_URL di .env file

### Test 2: Demo Account Buttons

**Langkah:**
1. Buka halaman login
2. Klik salah satu demo account button (👑 Owner, 🔐 Admin, atau 💳 Cashier)
3. Email dan password akan otomatis terisi
4. Klik "Masuk"

**Expected Result:**
- ✅ Demo account credentials otomatis terisi di form
- ✅ Login dengan demo account berhasil
- ✅ Sesuai dengan role yang dipilih

### Test 3: Error Handling - Invalid Credentials

**Langkah:**
1. Masukkan email: `invalid@test.com`
2. Masukkan password: `wrongpassword`
3. Klik "Masuk"

**Expected Result:**
- ✅ Error message ditampilkan di form: "Invalid credentials" atau error message dari backend
- ✅ Tombol "Masuk" tetap aktif untuk mencoba lagi
- ✅ Input fields tetap bisa diedit

### Test 4: Error Handling - Backend Not Responding

**Langkah:**
1. Stop backend server (Ctrl+C)
2. Coba login dengan credentials yang valid

**Expected Result:**
- ✅ Error message ditampilkan: "ECONNREFUSED" atau "Failed to fetch from server"
- ✅ Tombol "Masuk" tetap aktif untuk mencoba lagi setelah backend restart

### Test 5: Loading State

**Langkah:**
1. Masukkan email dan password yang valid
2. Klik "Masuk"
3. Amati state selama proses loading (3-5 detik)

**Expected Result:**
- ✅ Tombol "Masuk" disabled dan berubah jadi "Masuk..."
- ✅ Input fields disabled
- ✅ Demo account buttons disabled
- ✅ Text "Menghubungi server..." muncul
- ✅ Setelah selesai, semua kembali normal atau redirect ke dashboard

## 📱 Browser DevTools Testing

### Console Logging

Buka browser DevTools (F12) dan cek console. Seharusnya ada logs:

```javascript
// Sebelum login
"Attempting login with email: fikri@madura.com"

// Setelah login berhasil
"Login successful, response: {user, token, outlets}"
"User logged in, fetching outlets..."
"Calling onLoginSuccess with: [user, outlet, outlets]"

// Error (jika ada)
"Login error: {error details}"
```

### Network Tab

1. Buka DevTools → Network tab
2. Klik "Masuk"
3. Amati request yang dikirim:

**Expected Request:**
```
POST http://localhost:5000/api/auth/login
Headers:
  - Content-Type: application/json
Body:
  {
    "email": "fikri@madura.com",
    "password": "fikri123"
  }
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "email": "fikri@madura.com",
      "name": "Fikri",
      "role": "owner",
      "status": "active",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

**Expected Outlets Request:**
```
GET http://localhost:5000/api/outlets
Headers:
  - Authorization: Bearer {token}
```

**Expected Outlets Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "outlet_1",
      "name": "Outlet Surabaya",
      "address": "Jl. Madura No. 1",
      ...
    },
    {
      "id": "outlet_2",
      "name": "Outlet Malang",
      ...
    }
  ],
  "statusCode": 200
}
```

### LocalStorage

Buka DevTools → Application → LocalStorage

Setelah login berhasil, seharusnya ada:

```javascript
localStorage.getItem('auth_token')      // Token JWT
localStorage.getItem('user')            // User object (JSON string)
```

## ⚠️ Troubleshooting

### "Cannot find module '../hooks'"

**Solusi:**
- Pastikan file `src/hooks/index.ts` sudah dibuat
- Restart dev server: `npm start`

### "API_URL is not defined"

**Solusi:**
- Tambahkan `.env` file di root project dengan:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  ```
- Restart dev server

### CORS Error

**Solusi:**
- Pastikan backend sudah konfigurasi CORS
- Cek di backend apakah sudah ada:
  ```javascript
  app.use(cors({
    origin: 'http://localhost:3000'
  }));
  ```

### Token Expired / 401 Error

**Solusi:**
- Ini normal jika token sudah expired
- User akan otomatis di-redirect ke login page
- LocalStorage akan di-clear

### Login Berhasil tapi Tidak Redirect

**Kemungkinan Penyebab:**
1. Backend mengembalikan outlets tapi format tidak sesuai
2. `onLoginSuccess` callback tidak properly connected
3. Outlets array kosong

**Debug:**
- Cek console untuk logs "Calling onLoginSuccess with..."
- Amati Network tab untuk response outlets
- Cek bahwa outlets memiliki struktur yang benar

## ✅ Integration Checklist

- [ ] Backend running di http://localhost:5000
- [ ] Frontend running di http://localhost:3000
- [ ] `.env` file sudah dibuat dengan REACT_APP_API_URL
- [ ] `src/hooks/index.ts` sudah ada
- [ ] `src/services/api.ts` sudah ada
- [ ] LoginPage.tsx sudah terintegrasi dengan useAuth hook
- [ ] Login berhasil dengan valid credentials
- [ ] Demo account buttons berfungsi
- [ ] Error handling berfungsi
- [ ] User data disimpan di state dan localStorage
- [ ] Outlets diambil setelah login
- [ ] Redirect ke dashboard setelah login

## 📊 Next Steps

Setelah LoginPage berhasil terintegrasi:

1. **Integrasikan HomePage** untuk POS dan transactions
2. **Integrasikan AdminDashboard** untuk user management
3. **Integrasikan OwnerDashboard** untuk analytics dan reports
4. **Setup authentication guard** untuk route protection
5. **Test semua flows** dari login sampai logout

---

**Jika ada pertanyaan atau error, cek console logs di browser atau backend untuk detail error yang lebih jelas.**
