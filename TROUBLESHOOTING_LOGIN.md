# Troubleshooting Login Issues - Network Connection Problems

## Problem: "Stuck di menghubungi server" saat login

Ini berarti frontend tidak bisa menghubungi backend API. Berikut adalah langkah-langkah untuk debugging:

---

## Step 1: Verifikasi Backend Sedang Running

### Windows PowerShell
```powershell
# Check apakah port 5000 sudah digunakan
netstat -ano | findstr :5000

# Jika ada proses yang menggunakan port 5000:
# Output akan menunjukkan: TCP    127.0.0.1:5000     0.0.0.0:0     LISTENING    [PID]

# Jika tidak ada output = backend tidak running
```

### Checklist Backend:
- [ ] Backend Node.js server sedang running di port 5000
- [ ] Database (MySQL/PostgreSQL) sedang running
- [ ] Tidak ada error di backend console
- [ ] Backend bisa menerima requests dari Postman

---

## Step 2: Verifikasi API Configuration

### File: `src/constants/api.ts`
```typescript
BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
```

**Verifikasi:**
- [ ] Base URL = `http://localhost:5000/api` (benar)
- [ ] Port 5000 sesuai dengan backend
- [ ] Path `/api` sesuai dengan backend routes

### Jika Backend di URL Berbeda:
Buat file `.env` di root project:
```env
REACT_APP_API_URL=http://your-backend-url:5000/api
REACT_APP_ENV=development
```

Kemudian restart frontend development server (Ctrl+C, kemudian `npm start`)

---

## Step 3: Test Network Connection

### Cara 1: Gunakan Browser Console
1. Buka aplikasi (biasanya `http://localhost:3000`)
2. Tekan `F12` untuk buka Developer Tools
3. Buka tab **Console**
4. Jalankan perintah ini:

```javascript
// Test backend connection
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'fikri@madura.com', password: 'fikri123' })
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**Expected Responses:**
- ✅ `Status: 200` - Login berhasil
- ✅ `Status: 401` - Email/password salah (backend bisa dihubungi)
- ❌ `Error: Failed to fetch` - Backend tidak running atau CORS issue

---

## Step 4: Check Backend CORS Configuration

Jika Anda lihat error "CORS policy blocked request", backend perlu allow requests dari localhost:3000.

### Backend Express/Node.js Configuration (contoh):
```javascript
// app.js atau server.js
const cors = require('cors');

// Allow frontend development server
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Step 5: Check Network Tab

1. Buka Developer Tools (`F12`)
2. Pergi ke tab **Network**
3. Coba login
4. Lihat request ke `/auth/login`

**Analisis:**
| Status | Arti | Solusi |
|--------|------|--------|
| Red X, No Response | Backend tidak ditemukan | Pastikan backend running di port 5000 |
| 404 | Endpoint tidak ditemukan | Check URL path di api.ts |
| 401 | Email/password salah | Credentials benar, backend ditemukan |
| 500 | Server error | Check backend console untuk error details |
| 200 | Success | Login berhasil |

---

## Step 6: Check Browser Console untuk Errors

Di Developer Tools → **Console** tab, lihat apakah ada error merah:

### Error Examples & Solutions:

❌ **"GET http://localhost:5000/api/... net::ERR_CONNECTION_REFUSED"**
- Backend tidak running
- Solusi: Jalankan backend server

❌ **"CORS policy: No 'Access-Control-Allow-Origin' header"**
- Backend tidak configured untuk CORS
- Solusi: Update backend CORS settings

❌ **"TypeError: Cannot read property 'success' of undefined"**
- Response format tidak sesuai
- Solusi: Check backend response format

✅ **No error, response success** 
- API connection OK, cek credentials

---

## Step 7: Verify Demo Account Credentials

Default demo account untuk owner:
```
Email: fikri@madura.com
Password: fikri123
```

**Check:**
- [ ] Account ini ada di database backend
- [ ] Status = 'active'
- [ ] Role = 'owner'

Jika perlu, check di database:
```sql
-- MySQL
SELECT id, email, name, role, status FROM users WHERE email = 'fikri@madura.com';

-- PostgreSQL
SELECT id, email, name, role, status FROM users WHERE email = 'fikri@madura.com';
```

---

## Step 8: Enable Debug Logging

Update `src/hooks/index.ts` untuk menambah logging:

```typescript
const login = useCallback(async (email: string, password: string) => {
  setLoading(true);
  setError(null);
  try {
    console.log('[DEBUG] Attempting login with:', email);
    console.log('[DEBUG] Sending request to:', authAPI.login.toString());
    
    const response = await authAPI.login(email, password);
    
    console.log('[DEBUG] Login response:', response);
    console.log('[DEBUG] Response status:', response.success);
    
    if (response.success && response.data) {
      const { user, token } = response.data;
      console.log('[DEBUG] User:', user);
      console.log('[DEBUG] Token:', token ? 'Received' : 'Missing');
      setUser(user);
      setToken(token);
      localStorage.setItem('madura_user', JSON.stringify(user));
      localStorage.setItem('madura_token', token);
      return response;
    }
    throw new Error(response.error || 'Login gagal');
  } catch (err) {
    console.error('[ERROR] Login failed:', err);
    const message = err instanceof AxiosError 
      ? err.response?.data?.error || err.message 
      : String(err);
    setError(message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);
```

---

## Debugging Checklist

### Sebelum Login Attempt:
- [ ] Backend server running di `http://localhost:5000`
- [ ] Database connected dan berjalan
- [ ] Frontend development server running di `http://localhost:3000`
- [ ] `src/constants/api.ts` menunjuk ke URL yang benar
- [ ] CORS configured di backend

### Saat Login Attempt:
- [ ] Browser console terbuka (F12)
- [ ] Network tab aktif
- [ ] Lihat request `/auth/login`
- [ ] Catat status code dan response

### Jika Stuck:
1. Buka Network tab
2. Lihat request `/auth/login`
3. Check status code dan response
4. Refer ke tabel di atas untuk solusi

---

## Quick Start Commands

### Terminal 1 - Start Backend
```bash
cd [path-to-backend-project]
npm install
npm start
# atau
node server.js
```

### Terminal 2 - Start Frontend
```bash
cd [path-to-frontend-project]
npm install
npm start
# Frontend akan buka otomatis di http://localhost:3000
```

### Terminal 3 - Test API (Optional)
```bash
# Test backend is running
curl http://localhost:5000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"fikri@madura.com","password":"fikri123"}'
```

---

## Common Issues & Solutions

### Issue 1: Network Error - Connection Refused
**Symptoms:** Error "Cannot connect to server"  
**Cause:** Backend not running  
**Solution:**
1. Check if backend is running: `netstat -ano | findstr :5000`
2. Start backend server
3. Verify in browser: `curl http://localhost:5000/api/auth/login`

### Issue 2: CORS Error
**Symptoms:** "CORS policy blocked"  
**Cause:** Backend CORS not configured  
**Solution:** Check backend CORS settings

### Issue 3: 401 Unauthorized
**Symptoms:** Login form submitted but fails  
**Cause:** Wrong credentials or user not found  
**Solution:**
1. Verify user exists in database
2. Check password is correct
3. Check user status = 'active'

### Issue 4: Response Format Wrong
**Symptoms:** TypeError in console  
**Cause:** Backend response doesn't match expected format  
**Solution:** Check API response matches this format:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "...",
    "expiresIn": 86400
  },
  "statusCode": 200
}
```

---

## Getting More Help

When reporting issue, provide:
1. **Console errors** (from F12 Developer Tools)
2. **Network tab screenshot** (showing /auth/login request)
3. **Backend console logs**
4. **Credentials used for testing**
5. **API URL being used** (from constants/api.ts)

---

**Last Updated:** December 21, 2025
