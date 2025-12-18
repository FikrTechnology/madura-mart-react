# ✅ TESTING CHECKLIST - ADMIN INTEGRATION

## 🎯 TEST SCENARIO 1: OWNER MENAMBAH ADMIN

### Setup
```
1. Clear browser cache / localStorage (optional)
2. Open app
3. See Login Page dengan demo accounts
```

### Test Steps

**Step 1: Login as Owner**
```
□ Click "👑 Owner" button
□ Email field filled: fikri@madura.com
□ Password field filled: fikri123
□ Click "Masuk"
□ EXPECTED: OwnerDashboard opens
□ VERIFY: Header shows "📊 Dashboard Owner"
□ VERIFY: 5 tabs visible: Ringkasan, Inventory, Laporan, Produk, Manajemen
```

**Step 2: Navigate to Management Tab**
```
□ Click "🏪 Manajemen Outlet & Karyawan" tab
□ EXPECTED: Two-column layout appears
□ LEFT: Outlet cards (Toko Madura - Sidoarjo, Surabaya, Malang)
□ RIGHT: Employees section (initially empty)
```

**Step 3: Add New Admin Employee**
```
□ In right column, click "➕ Tambah Karyawan" button
□ EXPECTED: Modal form appears with title "➕ Tambah Karyawan Baru"
□ Fill fields:
   - Nama Karyawan: "Admin Sidoarjo Test"
   - Email: "admin.sidoarjo@test.com"
   - Password: "admin123"
   - Role: Select "Admin"
   - Outlet: Select "Toko Madura - Sidoarjo"
□ Click "Simpan" button
□ EXPECTED: Alert says "Karyawan berhasil ditambahkan!"
□ VERIFY: Modal closes
□ VERIFY: New employee card appears in the list
□ VERIFY: Card shows:
   - Name: "Admin Sidoarjo Test"
   - Email: "admin.sidoarjo@test.com"
   - Badge: "✅" (active status)
   - Role: "👨‍💼 Admin"
   - Outlet: "Toko Madura - Sidoarjo"
   - 3 action buttons: ✏️ 🔒 🗑️
```

**Step 4: Verify Data Persisted**
```
□ Open browser DevTools → Application → localStorage
□ Check key: "madura_employees"
□ VERIFY: Array contains new employee object:
   {
     id: "timestamp_string",
     name: "Admin Sidoarjo Test",
     email: "admin.sidoarjo@test.com",
     password: "admin123",
     role: "admin",
     outlet_ids: ["outlet_001"],
     status: "active",
     createdAt: "ISO_timestamp"
   }
```

**Step 5: Verify Demo Accounts Updated**
```
□ Logout (click "Keluar" button)
□ EXPECTED: Redirected to Login Page
□ VERIFY: Demo accounts now show:
   - 👑 Owner
   - 🔐 Admin (Admin Sidoarjo Test)  ← NEW!
   - 💳 Cashier
□ VERIFY: Email pre-fills when clicked
□ EMAIL FIELD: admin.sidoarjo@test.com
```

---

## 🎯 TEST SCENARIO 2: ADMIN LOGS IN & ACCESSES DASHBOARD

### Test Steps

**Step 1: Login as Admin**
```
□ On Login Page
□ Click "🔐 Admin (Admin Sidoarjo Test)" button
□ EXPECTED: Email field auto-filled: admin.sidoarjo@test.com
□ Manually enter password: admin123
□ Click "Masuk"
□ EXPECTED: AdminDashboard opens
□ VERIFY: Header shows "🏪 Dashboard Admin - Toko Madura - Sidoarjo"
```

**Step 2: Explore Admin Tabs**
```
□ Tab 1 - 📈 Ringkasan (Overview)
  ✓ VERIFY: Shows 4 metric cards:
    - 💰 Total Penjualan: Rp ...
    - 📊 Penjualan Hari Ini: Rp ...
    - 🛒 Total Transaksi: ...
    - 👥 Jumlah Karyawan: ... (should be 0-1)
  ✓ VERIFY: "🏆 Produk Terlaris" section

□ Tab 2 - 📦 Inventory
  ✓ VERIFY: Inventory cards:
    - 📊 Total Produk
    - 🔴 Stok Habis
    - 🟡 Stok Rendah
    - 💵 Nilai Inventaris
  ✓ VERIFY: "⚠️ Produk Stok Rendah" list

□ Tab 3 - 📊 Laporan & Analytics
  ✓ VERIFY: Period selector (Hari Ini, 7 Hari, 30 Hari, Semua)
  ✓ VERIFY: Export buttons (📄 PDF, 📊 CSV)
  ✓ VERIFY: Summary cards
  ✓ VERIFY: Payment breakdown chart
  ✓ VERIFY: Category performance list

□ Tab 4 - 📦 Produk
  ✓ VERIFY: Product grid shows products for assigned outlet only

□ Tab 5 - 👥 Karyawan (Employees)
  ✓ VERIFY: "👥 Karyawan - Toko Madura - Sidoarjo" header
  ✓ VERIFY: "➕ Tambah Karyawan" button
  ✓ VERIFY: Employee list (initially might be empty)
```

**Step 3: Verify Admin Can Manage Employees**
```
□ In 👥 Karyawan tab, click "➕ Tambah Karyawan"
□ EXPECTED: Form modal appears
□ Fill with Cashier data:
   - Nama: "Cashier Sidoarjo"
   - Email: "cashier.sidoarjo@test.com"
   - Password: "cashier123"
   - Role: "Cashier"
   - Outlet: Must stay "Toko Madura - Sidoarjo"
□ Click "Simpan"
□ EXPECTED: Employee card appears
□ VERIFY: Card shows all details correctly
□ VERIFY: localStorage updated with new cashier
```

**Step 4: Verify Admin Cannot See Other Outlets**
```
□ VERIFY: Admin dashboard shows ONLY "Toko Madura - Sidoarjo" data
□ VERIFY: No outlet management section (only employees)
□ VERIFY: All metrics/reports only for Sidoarjo outlet
□ VERIFY: Employee list shows only employees assigned to Sidoarjo
```

---

## 🎯 TEST SCENARIO 3: CASHIER LOGS IN & USES POS

### Test Steps

**Step 1: Login as Cashier**
```
□ Logout from Admin
□ On Login Page
□ VERIFY: Demo accounts show:
   - 👑 Owner
   - 🔐 Admin (Admin Sidoarjo Test)
   - 💳 Cashier (Cashier Sidoarjo)  ← NEW!
□ Click "💳 Cashier (Cashier Sidoarjo)" button
□ Email auto-filled: cashier.sidoarjo@test.com
□ Enter password: cashier123
□ Click "Masuk"
□ EXPECTED: HomePage (POS System) opens
□ VERIFY: NOT Admin Dashboard
□ VERIFY: Shows Sidebar + Product grid (existing POS UI)
```

**Step 2: Verify Cashier Access**
```
□ VERIFY: Cashier can see products for Sidoarjo outlet only
□ VERIFY: Can add items to cart (existing functionality)
□ VERIFY: Can process transactions (existing functionality)
□ VERIFY: CANNOT see management features
```

---

## 🎯 TEST SCENARIO 4: OWNER UPDATES EMPLOYEE STATUS

### Test Steps

**Step 1: Owner Deactivates Admin**
```
□ Login as Owner
□ Tab "🏪 Manajemen Outlet & Karyawan"
□ Find "Admin Sidoarjo Test" employee card
□ Click 🔒 button (deactivate button)
□ EXPECTED: Button changes from 🔒 to 🔓
□ VERIFY: Status badge changes from ✅ to ❌
```

**Step 2: Verify Admin Cannot Login**
```
□ Logout
□ Try to login as Admin with same credentials
□ Email: admin.sidoarjo@test.com
□ Password: admin123
□ Click "Masuk"
□ EXPECTED: Error message appears: "Email atau password salah"
   (because status is 'inactive', so not found in auth check)
□ VERIFY: Cannot access dashboard
```

**Step 3: Owner Reactivates Admin**
```
□ Login as Owner again
□ Find Admin card (now showing ❌)
□ Click 🔓 button (reactivate)
□ EXPECTED: Changes to 🔒 again
□ VERIFY: Status badge back to ✅
```

**Step 4: Verify Admin Can Login Again**
```
□ Logout
□ Login with same credentials
□ EXPECTED: Successful login to AdminDashboard
□ VERIFY: Dashboard displays normally
```

---

## 🎯 TEST SCENARIO 5: OWNER DEACTIVATES OUTLET

### Test Steps

**Step 1: Owner Deactivates Outlet**
```
□ Login as Owner
□ Tab "🏪 Manajemen Outlet & Karyawan"
□ Find outlet card "Toko Madura - Surabaya"
□ Click 🔒 button
□ EXPECTED: Status badge changes from ✅ to ❌
```

**Step 2: Verify Inactive Outlet Hidden from Dropdown**
```
□ Tab "📈 Ringkasan"
□ Look at "Tampilkan Data:" dropdown
□ VERIFY: "Toko Madura - Surabaya" NOT in dropdown list
□ ONLY shows: "🌐 Semua Outlet" and active outlets
```

**Step 3: Verify Active Employees Still Access Their Outlet**
```
□ If employee is at Sidoarjo (active):
   - Admin should still be able to login
   - Cashier should still be able to login
□ Both should work normally
```

---

## 🎯 TEST SCENARIO 6: FORM VALIDATION

### Test Steps

**Step 1: Empty Email/Password Validation**
```
□ Owner tries to add employee with empty fields
□ Fill only: Name = "Test"
□ Leave Email & Password empty
□ Click "Simpan"
□ EXPECTED: Alert: "Semua field harus diisi!"
□ VERIFY: Form stays open
```

**Step 2: Duplicate Email Validation**
```
□ Try to add employee with existing email
□ Fill: Email = "admin.sidoarjo@test.com" (already exists)
□ Click "Simpan"
□ EXPECTED: Alert: "Email sudah digunakan karyawan lain!" (for edit)
           OR "Email sudah terdaftar!" (for add new)
□ VERIFY: Form stays open
```

**Step 3: Outlet Selection Required**
```
□ Try to add employee without selecting outlet
□ Leave Outlet selection default/empty
□ Click "Simpan"
□ EXPECTED: Alert: "Semua field harus diisi!"
□ VERIFY: Cannot save without outlet
```

---

## 🎯 TEST SCENARIO 7: RESPONSIVE DESIGN

### Test Steps

**Step 1: Desktop View (1200px+)**
```
□ Login as Admin
□ VERIFY: Dashboard shows full layout
□ VERIFY: Charts and tables display well
□ VERIFY: Sidebar/navigation visible
```

**Step 2: Tablet View (768px)**
```
□ Open DevTools
□ Set viewport to 768x1024 (iPad)
□ VERIFY: Layout adapts
□ VERIFY: Menu collapses or reorganizes
□ VERIFY: Cards stack in 1-2 columns
□ VERIFY: Tables still readable
```

**Step 3: Mobile View (480px)**
```
□ Set viewport to 375x667 (iPhone)
□ VERIFY: Single column layout
□ VERIFY: Buttons accessible
□ VERIFY: Forms are usable
□ VERIFY: Modal popups fit screen
□ VERIFY: No horizontal scrolling
```

---

## 🎯 TEST SCENARIO 8: EDIT & DELETE OPERATIONS

### Test Steps

**Step 1: Edit Employee**
```
□ Admin in dashboard
□ Find employee card
□ Click ✏️ (edit) button
□ EXPECTED: Modal form appears with title "✏️ Edit Karyawan"
□ VERIFY: All fields pre-filled with current data
□ Change a field: Name = "Cashier Updated"
□ Click "Perbarui"
□ EXPECTED: Card updates immediately
□ VERIFY: localStorage updated
```

**Step 2: Delete Employee**
```
□ Find employee card to delete
□ Click 🗑️ (delete) button
□ EXPECTED: Confirm dialog: "Yakin ingin menghapus karyawan ini?"
□ Click OK/Yes
□ EXPECTED: Employee card disappears
□ VERIFY: localStorage updated
□ VERIFY: If re-login, employee no longer exists
```

---

## 📊 EXPECTED DATA IN localStorage

### After Full Test Scenario:

**madura_employees** (should contain):
```javascript
[
  {
    id: "original_owner_timestamp",
    email: "fikri@madura.com",
    name: "Fikri (Owner)",
    role: "owner",
    outlets: ["outlet_001", "outlet_002", "outlet_003"],
    status: "active"
  },
  {
    id: "timestamp1",
    name: "Admin Sidoarjo Test",
    email: "admin.sidoarjo@test.com",
    password: "admin123",
    role: "admin",
    outlet_ids: ["outlet_001"],
    status: "active" // or "inactive" depending on test
  },
  {
    id: "timestamp2",
    name: "Cashier Sidoarjo",
    email: "cashier.sidoarjo@test.com",
    password: "cashier123",
    role: "cashier",
    outlet_ids: ["outlet_001"],
    status: "active"
  }
]
```

**madura_outlets** (should contain):
```javascript
[
  {
    id: "outlet_001",
    name: "Toko Madura - Sidoarjo",
    address: "...",
    phone: "...",
    status: "active"
  },
  {
    id: "outlet_002",
    name: "Toko Madura - Surabaya",
    address: "...",
    phone: "...",
    status: "inactive" // if deactivated during test
  },
  {
    id: "outlet_003",
    name: "Toko Madura - Malang",
    address: "...",
    phone: "...",
    status: "active"
  }
]
```

---

## ✅ FINAL VERIFICATION CHECKLIST

```
Authentication:
  □ Owner login works
  □ Admin login works
  □ Cashier login works
  □ Inactive employees cannot login
  □ Wrong password shows error
  □ Demo accounts show correct names

Dashboard Routing:
  □ Owner sees OwnerDashboard
  □ Admin sees AdminDashboard
  □ Cashier sees HomePage (POS)

Owner Features:
  □ Can add/edit/delete employees
  □ Can add/edit/delete outlets
  □ Can toggle employee status
  □ Can toggle outlet status
  □ Can see all outlets

Admin Features:
  □ Can see assigned outlet only
  □ Can add/edit/delete employees at outlet
  □ Can view inventory
  □ Can view reports
  □ Can export PDF/CSV
  □ Cannot manage outlets
  □ Cannot see other outlets

Cashier Features:
  □ Can access POS
  □ Can process transactions
  □ Can see history
  □ Cannot access management

Data Persistence:
  □ localStorage saves correctly
  □ Data persists after refresh
  □ Demo accounts update after adding employees
  □ Inactive status respected

Responsive Design:
  □ Desktop (1200px) works
  □ Tablet (768px) works
  □ Mobile (480px) works

Error Handling:
  □ Empty fields show error
  □ Duplicate email shows error
  □ Inactive account shows error
  □ All errors clear/helpful
```

---

## 🎓 NOTES FOR TESTING

1. **First time**: Clear localStorage or use incognito mode
2. **Demo accounts**: Auto-update after each employee addition
3. **Refresh page**: If data not appearing, try F5
4. **DevTools**: Use Application tab to inspect localStorage
5. **Mobile test**: Use Chrome DevTools device emulation
6. **Password**: Remember to use correct password for added employees

---

**Testing Status**: READY ✅  
**Last Updated**: December 18, 2025  
**Estimated Time**: 30-45 minutes for full test
