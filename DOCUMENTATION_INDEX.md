# 📚 Madura Mart - Documentation Index

---

## 🆕 Backend Integration (December 2024)

**⚡ New!** The frontend has been integrated with the backend API. Start here if you're working with the new backend.

### Quick Links
- 📖 [README_INTEGRATION.md](./README_INTEGRATION.md) - Complete integration overview
- ⚡ [QUICK_START_INTEGRATION.md](./QUICK_START_INTEGRATION.md) - 5-minute quickstart
- 📚 [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Detailed API reference
- ✅ [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) - Implementation summary
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing procedures

### What's New?
- ✅ All 33 API endpoints integrated from Postman collection
- ✅ JWT authentication with token management
- ✅ Role-based access control (Owner, Admin, Cashier)
- ✅ Multi-outlet support
- ✅ Complete POS functionality
- ✅ Sales reporting and analytics

---

## 🎯 Start Here (Pilih Sesuai Kebutuhan)

### 👶 **Saya Pemula, Mau Paham Project**
1. Baca: [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Overview apa yang sudah dilakukan
2. Baca: [ARCHITECTURE.md](ARCHITECTURE.md) - Pahami struktur & design pattern
3. Baca: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup lokal project

### 🚀 **Saya Mau Mulai Setup Lokal**
1. Baca: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Quick start
2. Setup database: [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Test API: [API_INTEGRATION.md](API_INTEGRATION.md)

### 🔌 **Saya Backend Developer, Mau Lihat API Spec**
1. Baca: [API_INTEGRATION.md](API_INTEGRATION.md) - Lengkap endpoint specifications
2. Setup database: [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Implementasi endpoints sesuai spec

### 🗄️ **Saya Mau Setup Database**
1. Baca: [DATABASE_SETUP.md](DATABASE_SETUP.md) - Pilih MySQL/PostgreSQL/Supabase
2. Jalankan: `database_mysql.sql` atau `database_postgresql.sql`
3. Verify dengan queries di dokumentasi

### ➕ **Saya Mau Tambah Feature Baru**
1. Baca: [ARCHITECTURE.md](ARCHITECTURE.md) - Lihat section "Adding New Feature"
2. Follow template di sana
3. Test dengan Postman/Insomnia

### 🏗️ **Saya Mau Refactor Components**
1. Baca: [ARCHITECTURE.md](ARCHITECTURE.md) - Pahami component pattern
2. Lihat examples di [ARCHITECTURE.md](ARCHITECTURE.md)
3. Refactor mengikuti pattern

---

## 📄 Dokumen Lengkap

### Core Documentation

#### 1. **REFACTORING_SUMMARY.md** ⭐ START HERE
- Overview refactoring yang dilakukan
- Pattern explanation
- Quick start guide
- Learning path untuk pemula
- Feature template
- Next steps

#### 2. **ARCHITECTURE.md** 🏗️ DESIGN PATTERN
- Detailed architecture explanation
- 5 layer system breakdown
- Data flow diagram
- Best practices
- Adding new feature (step by step)
- Component pattern explanation

#### 3. **SETUP_GUIDE.md** 🚀 QUICK START
- Installation steps
- Environment configuration
- Running project locally
- Project structure overview
- API configuration
- Authentication flow
- Testing API integration
- Troubleshooting common issues
- Supabase integration

#### 4. **API_INTEGRATION.md** 🔌 BACKEND SPECIFICATION
- Backend requirements
- Complete API endpoints (Auth, Products, Outlets, Transactions, Users)
- Request/Response format examples
- Service usage examples
- Error response format
- Integration checklist
- Test credentials

#### 5. **DATABASE_SETUP.md** 🗄️ DATABASE
- Database overview
- Table details & relationships
- Setup instructions (MySQL, PostgreSQL, Supabase)
- Sample data
- User roles & permissions
- Useful SQL queries
- Migration guide

---

## 🗂️ Project Structure

```
madura-mart-react/
├── src/
│   ├── api/                    # HTTP Client
│   │   ├── axiosInstance.js   # Axios config + interceptors
│   │   └── handleApiError.js  # Error handling
│   │
│   ├── services/               # Business Logic
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── transactionService.js
│   │   └── outletService.js
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   ├── useForm.js
│   │   └── index.js
│   │
│   ├── store/                  # Global State
│   │   └── authContext.js
│   │
│   ├── constants/              # Configuration
│   │   └── api.js
│   │
│   ├── utils/                  # Helpers
│   │   ├── helpers.js
│   │   └── pdfGenerator.js
│   │
│   ├── components/             # UI Components
│   │   └── ...existing files
│   │
│   ├── context/                # Legacy (akan refactor)
│   │   └── OutletContext.js
│   │
│   └── App.js
│
├── REFACTORING_SUMMARY.md      ⭐ START HERE
├── ARCHITECTURE.md              🏗️ DESIGN PATTERN
├── SETUP_GUIDE.md              🚀 QUICK START
├── API_INTEGRATION.md          🔌 API SPEC
├── DATABASE_SETUP.md           🗄️ DATABASE
├── database_mysql.sql          📦 MYSQL SCHEMA
├── database_postgresql.sql     📦 POSTGRESQL SCHEMA
├── package.json
├── README.md
└── ...other files
```

---

## 🔑 Key Files Summary

| File | Purpose | When to Use |
|------|---------|------------|
| `src/api/axiosInstance.js` | HTTP client config | Understand API requests |
| `src/api/handleApiError.js` | Error handling | Debug API errors |
| `src/services/*.js` | Business logic | Add/modify business logic |
| `src/hooks/useAuth.js` | Auth state | Implement authentication |
| `src/hooks/useFetch.js` | Data fetching | Load data from API |
| `src/hooks/useForm.js` | Form handling | Create/edit forms |
| `src/store/authContext.js` | Global state | Share user across app |
| `src/constants/api.js` | API endpoints | Change API URLs |
| `src/utils/helpers.js` | Helper functions | Utility functions |

---

## 📊 API Endpoints Quick Reference

```
Authentication:
  POST /auth/login           - Login user
  POST /auth/register        - Register user
  POST /auth/logout          - Logout user

Products:
  GET /products              - Get all products
  GET /products/:id          - Get by ID
  POST /products             - Create product
  PUT /products/:id          - Update product
  DELETE /products/:id       - Delete product

Transactions:
  GET /transactions          - Get all transactions
  GET /transactions/:id      - Get by ID
  POST /transactions         - Create transaction

Outlets:
  GET /outlets               - Get all outlets
  GET /outlets/:id           - Get by ID
  POST /outlets              - Create outlet
  PUT /outlets/:id           - Update outlet

Users:
  GET /users                 - Get all users
  POST /users                - Create user
  PUT /users/:id             - Update user
  DELETE /users/:id          - Delete user
```

Full details → [API_INTEGRATION.md](API_INTEGRATION.md)

---

## 🗄️ Database Tables

```
outlets              - Store branches
users                - Users/employees
user_outlets         - User-outlet relationship
products             - Products/inventory
transactions         - Sales/invoices
transaction_items    - Items per transaction
stock_logs           - Audit log (optional)
```

Full details → [DATABASE_SETUP.md](DATABASE_SETUP.md)

---

## 🎓 Learning Resources

### For Beginners
1. Start with [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Pattern Explanation"
3. Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)
4. Try adding a simple feature

### For Intermediate
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) - All sections
2. Understand [API_INTEGRATION.md](API_INTEGRATION.md) specs
3. Setup [DATABASE_SETUP.md](DATABASE_SETUP.md)
4. Implement complex features

### For Advanced
1. Refactor components to follow pattern
2. Add error handling & validation
3. Implement caching strategy
4. Setup CI/CD pipeline

---

## ✅ Checklist untuk Mulai

- [ ] Read REFACTORING_SUMMARY.md
- [ ] Read ARCHITECTURE.md
- [ ] Run `npm install`
- [ ] Setup `.env` dengan API_URL
- [ ] Setup database (MySQL/PostgreSQL/Supabase)
- [ ] Test API integration
- [ ] Refactor components menggunakan pattern
- [ ] Add new features

---

## 🆘 Troubleshooting

### Common Issues
| Issue | Solution | Doc |
|-------|----------|-----|
| CORS error | Configure backend CORS | [API_INTEGRATION.md](API_INTEGRATION.md) |
| 401 Unauthorized | Check token, review auth | [SETUP_GUIDE.md](SETUP_GUIDE.md) |
| API URL not working | Update .env file | [SETUP_GUIDE.md](SETUP_GUIDE.md) |
| Database error | Verify schema setup | [DATABASE_SETUP.md](DATABASE_SETUP.md) |
| Module not found | Check import paths | [ARCHITECTURE.md](ARCHITECTURE.md) |

---

## 🔗 Navigation

```
Quick Links:
📘 Learn Pattern      → ARCHITECTURE.md
🚀 Setup Project      → SETUP_GUIDE.md
🔌 API Specification  → API_INTEGRATION.md
🗄️ Database Schema    → DATABASE_SETUP.md
📝 What's Changed     → REFACTORING_SUMMARY.md
```

---

## 📞 Getting Help

### Pahami Architecture
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

### Setup Issues
→ Read [SETUP_GUIDE.md](SETUP_GUIDE.md) Troubleshooting section

### API Issues
→ Check [API_INTEGRATION.md](API_INTEGRATION.md)

### Database Issues
→ Check [DATABASE_SETUP.md](DATABASE_SETUP.md)

### Adding Features
→ Follow template di [ARCHITECTURE.md](ARCHITECTURE.md) "Adding New Feature"

---

**Happy Coding! 🎉**

Start dengan membaca [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) atau langsung [SETUP_GUIDE.md](SETUP_GUIDE.md) untuk quick start.
