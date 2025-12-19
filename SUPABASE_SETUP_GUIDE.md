# Supabase Setup Guide - Madura Mart POS System

Panduan lengkap setup Supabase sebagai database online menggantikan MySQL lokal.

---

## 📌 Apa itu Supabase?

Supabase adalah open-source Firebase alternative yang menyediakan:
- ✅ PostgreSQL database (bukan MySQL, tapi lebih powerful)
- ✅ Real-time database
- ✅ Authentication built-in
- ✅ REST API auto-generated
- ✅ File storage
- ✅ Pricing model: Free tier 500MB storage + generous limits
- ✅ No credit card required untuk free tier

**Website:** https://supabase.com

---

## 🎯 Kelebihan Supabase vs MySQL Lokal

| Feature | MySQL Lokal | Supabase |
|---------|-------------|----------|
| Setup | Kompleks | Simple (cloud) |
| Hosting | Manual (VPS) | Otomatis |
| Backup | Manual | Otomatis daily |
| Scaling | Perlu upgrade server | Automatic |
| Real-time | Tidak built-in | Built-in websocket |
| Authentication | Perlu setup manual | Built-in & ready |
| Cost | Server fees | Free/affordable |
| Uptime | Dependent server | 99.9% SLA |

---

## ✅ Step 1: Create Supabase Account

### 1.1 Daftar Account

1. Buka https://supabase.com
2. Klik "Sign Up" atau "Start for free"
3. Pilih login method:
   - Email & password
   - GitHub (recommended - instant setup)
   - Google account

**Recommended:** Gunakan GitHub untuk instant sync dengan project

### 1.2 Verifikasi Email

- Supabase akan kirim verification email
- Klik link untuk verify
- Done! Account sudah active

---

## 🏗️ Step 2: Create New Project

### 2.1 Create Organization (First time only)

1. Setelah login, klik "New Project"
2. Atau klik "New Organization" jika belum ada
3. Isi organization name: "Madura Mart"
4. Pilih plan: **"Free"** (untuk development)

### 2.2 Create Project

1. Klik "New Project" di organization
2. Isi form:
   ```
   Project Name:     madura-mart-db
   Database Password: [Generate strong password - SAVE THIS!]
   Region:          Singapore (atau terdekat dengan lokasi)
   Plan:            Free (Tier)
   ```

3. Klik "Create new project"
4. Tunggu 2-5 menit sampai project siap (ada loading bar)

### 2.3 Simpan Credentials

Setelah project selesai, Supabase akan show credentials di welcome screen:

```
Project URL:     https://xxxxx.supabase.co
Anon Key:        eyJhbGc...
Service Role Key: eyJhbGc...
Database URL:    postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres
```

**⚠️ PENTING:** Simpan ketiga nilai ini di tempat aman:
- `.env` file (jangan commit ke Git)
- Password manager
- Backup aman

---

## 🗄️ Step 3: Akses Database Management

### 3.1 SQL Editor (Built-in)

Supabase menyediakan SQL editor di dashboard:

1. Login ke Supabase
2. Pilih project "madura-mart-db"
3. Klik "SQL Editor" di sidebar kiri
4. Atau langsung buka: `https://xxxxx.supabase.co/editor/`

### 3.2 Alternative: DBeaver (Desktop Client)

Jika lebih nyaman dengan desktop app:

1. Download DBeaver: https://dbeaver.io/download/
2. Install dan buka
3. Klik "Database" → "New Database Connection"
4. Pilih "PostgreSQL"
5. Isi connection detail:
   ```
   Server Host:     xxxxx.supabase.co
   Port:           5432
   Database:       postgres
   Username:       postgres
   Password:       [dari step 2.3]
   ```
6. Test connection
7. Done! Sekarang bisa manage database seperti MySQL Workbench

---

## 🔐 Step 4: Setup Authentication

Supabase punya built-in Auth system (berbeda dari MySQL):

### 4.1 Enable Auth Providers

1. Buka project Supabase
2. Klik "Authentication" di sidebar
3. Klik "Providers"
4. Atur provider yang ingin digunakan:

**Email & Password (Default):**
- Sudah enabled by default
- Cocok untuk cashier login

**Google OAuth (Optional):**
1. Klik "Google"
2. Isi Google OAuth credentials (dari Google Cloud Console)
3. Enable

### 4.2 Email Settings (Optional)

1. Klik "Email Templates"
2. Customize email confirmation, password reset, dll
3. Atau gunakan default dari Supabase

### 4.3 URL Configuration

1. Klik "URL Configuration"
2. Isi:
   ```
   Site URL:                http://localhost:3000 (dev)
   Redirect URLs:          http://localhost:3000/auth/callback
   Additional URLs (prod): https://yourdomain.com/auth/callback
   ```

---

## 📦 Step 5: Connection String & Environment Variables

### 5.1 Generate Connection Strings

Di Supabase dashboard:

1. Klik "Settings" (gear icon)
2. Klik "Database"
3. Scroll ke "Connection Strings"
4. Pilih tab sesuai driver:
   - **PostgreSQL** (untuk backend)
   - **Node.js** (cocok untuk Express)
   - **URI** (standart PostgreSQL format)

### 5.2 URI Format

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

Contoh:
postgresql://postgres:abc123xyz@xxxxx.supabase.co:5432/postgres
```

### 5.3 Backend .env Configuration

Untuk Express backend:

```env
# Supabase Connection
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database URL (jika menggunakan pg library)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# JWT (sudah di Supabase, tapi bisa custom)
JWT_SECRET=your_secret_key

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

### 5.4 Frontend .env.local Configuration

Untuk React app:

```env
# Supabase (public keys, aman untuk client)
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...

# API Backend (jika tetap pakai backend)
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 🧪 Step 6: Test Connection

### 6.1 Test via SQL Editor

1. Buka Supabase Dashboard
2. Klik "SQL Editor"
3. Jalankan query test:

```sql
-- Test connection
SELECT NOW() as current_time;

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Jika berhasil, akan return current timestamp dan list tables.

### 6.2 Test via psql (Command Line)

```bash
# Install psql (PostgreSQL client)
# Windows: Download PostgreSQL installer, check "pgAdmin 4" and "psql"
# Mac: brew install postgresql
# Linux: apt-get install postgresql-client

# Connect ke Supabase
psql -h xxxxx.supabase.co -U postgres -d postgres

# Masukkan password saat diminta (dari step 2.3)
# Type: SELECT 1;
# Output: 1 (success)
```

### 6.3 Test via Node.js

```javascript
// test-connection.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxxxx.supabase.co';
const supabaseKey = 'eyJhbGc...';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test select
async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}

test();
```

---

## 🔒 Step 7: Setup Security & Row Level Security (RLS)

### 7.1 Apa itu RLS (Row Level Security)?

RLS adalah fitur PostgreSQL untuk kontrol akses berdasarkan row/baris:
- Owner hanya bisa lihat data mereka
- Admin hanya bisa lihat outlet mereka
- Cashier hanya bisa lihat assigned outlet

### 7.2 Enable RLS per Table

1. Buka Supabase Dashboard
2. Klik "Authentication" → "Policies"
3. Atau klik "Table Editor" → pilih table → "RLS" tab
4. Klik "Enable RLS"
5. Klik "Create policy"

### 7.3 Policy Examples

**Policy untuk table `users` (owner hanya bisa lihat diri sendiri):**

```sql
CREATE POLICY "Users can select their own data"
ON users
FOR SELECT
USING (
  auth.uid()::text = id  -- Condition: user ID harus sama dengan auth UID
);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (
  auth.uid()::text = id
);
```

**Policy untuk table `products` (admin bisa lihat product outlet mereka):**

```sql
CREATE POLICY "Admins can view products of their outlets"
ON products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employee_outlet_assignment
    WHERE employee_outlet_assignment.user_id = auth.uid()::text
    AND employee_outlet_assignment.outlet_id = products.outlet_id
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'owner'
  )
);
```

### 7.4 Testing RLS

Setelah policy aktif:
- Query tanpa auth akan di-block
- Query dengan auth yang tidak sesuai policy akan return empty

```javascript
// Dengan RLS, query perlu include Authorization header
const { data, error } = await supabase
  .from('users')
  .select('*')
  // Supabase JS client otomatis include auth header
  .single();
```

---

## 🔑 Step 8: API Keys Management

### 8.1 Tipe Keys

**Anon Key (Public):**
- Aman untuk client-side
- Dibuat ulang every 24 jam (configurable)
- Limited permissions sesuai RLS policies
- Boleh di-expose di frontend code

**Service Role Key (Private):**
- Secret, jangan di-expose
- Full database access
- Hanya untuk backend server
- Simpan di environment variable

**JWT Secret:**
- Untuk sign JWT tokens
- Auto-generated by Supabase
- Jangan perlu ganti

### 8.2 Rotate Keys (Keamanan)

1. Buka project settings
2. Klik "API"
3. Klik "Rotate key" di bawah Anon/Service keys
4. Update di .env files
5. Restart aplikasi

---

## 🚀 Step 9: First Time Setup Checklist

Sebelum mulai development:

- [ ] Create Supabase account
- [ ] Create project
- [ ] Simpan credentials (URL, Anon Key, Service Role Key)
- [ ] Test connection di SQL Editor
- [ ] Setup authentication providers
- [ ] Configure redirect URLs
- [ ] Test SQL query berhasil
- [ ] Create .env files dengan credentials
- [ ] Jangan commit .env ke Git
- [ ] Add `.env` ke `.gitignore`

---

## 📱 Real-time Features (Bonus)

Supabase mendukung real-time sync otomatis:

```javascript
// Listen for changes di table
const subscription = supabase
  .from('transactions')
  .on('*', payload => {
    console.log('Change detected!', payload);
    // Update UI otomatis
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

Cocok untuk:
- Live inventory updates
- Real-time sales dashboard
- Multi-user synchronization

---

## 💾 Backup & Recovery

Supabase automatically backup:
- **Frequency:** Daily
- **Retention:** 7 days (free tier)
- **Access:** Dashboard → Settings → Backups

Manual backup:

```bash
# Export ke SQL file
pg_dump postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres > backup.sql

# Import dari SQL file
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres < backup.sql
```

---

## ⚠️ Common Issues & Solutions

### Issue: Connection refused
```
Error: connect ECONNREFUSED
→ Check internet connection
→ Verify IP whitelisting (Supabase usually allows all)
→ Check password benar
```

### Issue: RLS blocking queries
```
Error: Policy Violation - Row level security
→ User tidak punya permission
→ Check RLS policy configuration
→ Pastikan auth user valid
```

### Issue: Quota exceeded
```
Error: Quota Exceeded
→ Upgrade plan (free tier limited)
→ Delete unused projects
→ Check dashboard untuk usage stats
```

### Issue: Key rotation error
```
Error: Invalid JWT
→ Update .env files dengan key baru
→ Restart aplikasi
→ Clear browser localStorage
```

---

## 🎓 Dokumentasi Referensi

- **Official Docs:** https://supabase.com/docs
- **JavaScript Client:** https://supabase.com/docs/reference/javascript
- **SQL Tutorials:** https://supabase.com/docs/guides/database
- **Auth Guide:** https://supabase.com/docs/guides/auth
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

## 📊 Pricing Tiers (Dec 2024)

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Storage | 500 MB | 100 GB | Unlimited |
| API Calls | ~50K/day | Unlimited | Unlimited |
| Users | Unlimited | Unlimited | Unlimited |
| Cost/Month | $0 | $25 | Custom |

**Rekomendasi:** Mulai dari Free tier untuk development, upgrade ke Pro saat production scale up.

---

## 🔄 Mitigasi Resiko

### Data Safety
- ✅ Regular backups automatic
- ✅ Point-in-time recovery tersedia
- ✅ PostgreSQL reliable

### Vendor Lock-in Prevention
- ✅ PostgreSQL standard (bukan proprietary)
- ✅ Bisa export data anytime
- ✅ Easy migrate to other PostgreSQL hosting

### Downtime Prevention
- ✅ 99.9% uptime SLA
- ✅ Geographic redundancy
- ✅ Instant failover

---

## ✨ Next Steps

1. **[SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md)** - Migrate database schema
2. **[SUPABASE_BACKEND_GUIDE.md](SUPABASE_BACKEND_GUIDE.md)** - Update backend code
3. **[SUPABASE_FRONTEND_INTEGRATION.md](SUPABASE_FRONTEND_INTEGRATION.md)** - Update React app

---

**Siap untuk start? Mari ke step berikutnya! 🚀**
