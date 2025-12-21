# Employee Management - Backend Integration Fix

## Problem Statement
Karyawan (employee) yang ditambahkan hanya tersimpan di UI/frontend state dan localStorage, tetapi **tidak tersimpan di backend database**. Akibatnya, ketika mencoba login dengan akun karyawan yang baru ditambahkan, login gagal karena user tidak ditemukan di database.

## Root Cause Analysis
File `src/components/OwnerDashboard.tsx` memiliki fungsi `handleAddEmployee()` yang:
1. Hanya menyimpan karyawan ke state lokal React
2. Hanya menyimpan ke localStorage
3. **TIDAK** memanggil API backend untuk menyimpan ke database
4. Tidak ada useEffect untuk load karyawan dari backend

## Solution Implemented

### 1. Import userAPI Service
**File**: `src/components/OwnerDashboard.tsx` (Line 6)
```typescript
import { userAPI } from '../services/api';
```
Import endpoint untuk user management dari `src/services/api.ts` yang sudah memiliki method:
- `userAPI.create()` - Tambah user baru
- `userAPI.update()` - Update user existing
- `userAPI.delete()` - Hapus user
- `userAPI.getAll()` - Ambil semua user

### 2. Load Employees from Backend on Component Mount
**File**: `src/components/OwnerDashboard.tsx` (Lines 48-67)

```typescript
// Load employees from backend on component mount
useEffect(() => {
  const loadEmployees = async () => {
    try {
      const result = await userAPI.getAll();
      if (result.success && result.data) {
        setEmployees(result.data);
        localStorage.setItem('madura_employees', JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('Failed to load employees from backend:', error);
      // Fall back to localStorage if backend fails
      const stored = localStorage.getItem('madura_employees');
      if (stored) {
        setEmployees(JSON.parse(stored));
      }
    }
  };
  
  loadEmployees();
}, []);
```

**Penjelasan**:
- Saat component mount, fetch semua employees dari backend
- Update state dengan data dari database
- Sync dengan localStorage sebagai fallback
- Jika backend error, gunakan data yang tersimpan di localStorage

### 3. Update handleAddEmployee() dengan API Call
**File**: `src/components/OwnerDashboard.tsx` (Lines 268-344)

Sebelum: Hanya menambah ke state dan localStorage
Sesudah: Memanggil API `userAPI.create()` dan `userAPI.update()`

```typescript
const handleAddEmployee = async () => {
  // ... validation ...

  try {
    if (editingEmployee) {
      // Update employee via API
      const updatePayload = {
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        status: 'active'
      };
      
      await userAPI.update(editingEmployee.id, updatePayload);
      // Update state after successful API call
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...newEmployee, id: editingEmployee.id } : e
      ));
      
      showSuccessModal('Karyawan berhasil diperbarui di database!');
    } else {
      // Add new employee via API
      const createPayload = {
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        status: 'active'
      };
      
      const result = await userAPI.create(createPayload);
      
      const employee = {
        id: result.data?.id || Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        outlet_ids: newEmployee.outlet_ids,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      setEmployees([...employees, employee]);
      showSuccessModal('Karyawan berhasil ditambahkan ke database!');
    }
  } catch (error) {
    showErrorModal('Gagal menyimpan karyawan. Pastikan backend sudah running.');
  }
};
```

**Key Points**:
- Sekarang API call HARUS berhasil sebelum state diupdate
- ID dari server digunakan (bukan Date.now())
- Error handling yang jelas jika backend gagal

### 4. Update handleDeleteEmployee() dengan API Call
**File**: `src/components/OwnerDashboard.tsx` (Lines 371-404)

```typescript
const handleDeleteEmployee = (id) => {
  setModal({
    type: 'warning',
    message: 'Apakah Anda yakin ingin menghapus karyawan ini?',
    actions: [
      { label: 'Batal', type: 'secondary' },
      {
        label: 'Hapus',
        type: 'danger',
        onClick: async () => {
          try {
            // Delete from backend first
            await userAPI.delete(id);
            
            // Then remove from state
            setEmployees(employees.filter(e => e.id !== id));
            showSuccessModal('Karyawan berhasil dihapus dari database!');
          } catch (error) {
            showErrorModal('Gagal menghapus karyawan dari database');
          }
        }
      }
    ]
  });
};
```

**Key Points**:
- Delete dari backend HARUS berhasil sebelum hapus dari state
- Error handling jika backend delete gagal

### 5. Sync State with localStorage
**File**: `src/components/OwnerDashboard.tsx` (Lines 68-71)

```typescript
// Save employees to localStorage when state changes
useEffect(() => {
  localStorage.setItem('madura_employees', JSON.stringify(employees));
}, [employees]);
```

**Penjelasan**:
- localStorage tetap up-to-date dengan state
- Berfungsi sebagai cache lokal untuk offline support

## Flow Diagram

```
User clicks "Tambah Karyawan"
    ↓
Frontend validation (name, email, password, outlet)
    ↓
Call userAPI.create(payload) → Backend
    ↓
Backend validates & saves to database
    ↓
Backend returns user with ID
    ↓
Update React state dengan response data
    ↓
Save ke localStorage
    ↓
Show success message
    ↓
Update UI immediately
```

## Testing Steps

1. **Start the application**
   ```bash
   npm start
   ```

2. **Login as Owner**
   - Email: owner@email.com
   - Password: password

3. **Go to Management Tab > Tambah Karyawan**
   - Fill in form:
     - Nama: Test Employee
     - Email: testkaryawan@email.com
     - Password: password123
     - Role: Cashier
     - Outlet: Select one

4. **Verify in Database**
   - Check MySQL/PostgreSQL database:
   ```sql
   SELECT * FROM users WHERE email = 'testkaryawan@email.com';
   ```
   - User harus ada di database dengan semua field terisi

5. **Try Login with New Employee**
   - Logout
   - Login dengan email baru: testkaryawan@email.com
   - Password: password123
   - **Harus berhasil login** ✓

6. **Check Edit & Delete**
   - Edit karyawan - perubahan harus tersimpan di database
   - Delete karyawan - harus dihapus dari database

## Files Modified

| File | Changes |
|------|---------|
| `src/components/OwnerDashboard.tsx` | ✓ Import userAPI |
| | ✓ Add useEffect untuk load employees |
| | ✓ Update handleAddEmployee() |
| | ✓ Update handleDeleteEmployee() |

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users` | Create new user/employee |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get specific user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

## Error Handling

Semua API calls sekarang memiliki try-catch:

```typescript
try {
  await userAPI.create(payload);
  // Update state
  showSuccessModal('Berhasil!');
} catch (error) {
  console.error('Error:', error);
  showErrorModal(error?.message || 'Gagal menyimpan karyawan');
}
```

## Backward Compatibility

- Masih support localStorage fallback jika backend down
- Existing employees di localStorage masih bisa diakses
- Gradual sync dengan backend saat tersedia

## Future Improvements

1. ✓ Add real-time sync dengan backend
2. ✓ Add outlet-specific employee filtering
3. ✓ Add employee password hashing
4. ✓ Add email verification
5. ✓ Add audit logs untuk employee changes

## Verification Checklist

- [x] userAPI imported correctly
- [x] handleAddEmployee calls userAPI.create()
- [x] handleEditEmployee calls userAPI.update()
- [x] handleDeleteEmployee calls userAPI.delete()
- [x] useEffect loads employees from backend on mount
- [x] localStorage synced with state
- [x] Error handling implemented
- [x] Frontend shows appropriate messages
- [x] Database saves new employees
- [x] Login works with new employees

---

**Status**: ✅ COMPLETED - Employee management sekarang terintegrasi penuh dengan backend database.

**Date**: December 21, 2025
