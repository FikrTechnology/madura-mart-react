# 🚀 Quick Start - Frontend-Backend Integration

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Node.js 14+ installed

## 5-Minute Quick Start

### Step 1: Verify Backend is Running
```bash
curl http://localhost:5000/api/health
# Should return: { "status": "ok" }
```

### Step 2: Start Frontend
```bash
cd madura-mart-react
npm start
# Frontend opens at http://localhost:3000
```

### Step 3: You Should See Login Page
- If not, click "🧹 Clear Session (Dev)" button to clear old session
- Wait for page to reload

### Step 4: Login with Demo Credentials
```
Email: fikri@madura.com
Password: fikri123
```

### Step 5: Verify You're Logged In
- Should redirect to Owner Dashboard automatically
- Check that outlets are loading in sidebar
- Check that products are showing in main area

## Common Issues & Quick Fixes

### ❌ "Cannot reach API" 
```bash
# Terminal 1 - Backend folder
npm start  # Should run on port 5000

# Terminal 2 - Frontend folder  
npm start  # Should run on port 3000
```

### ❌ "Login fails with credentials"
1. Test credentials in Postman first
2. Make sure backend is running
3. Check backend logs for errors

### ❌ "Outlets not loading"
1. Login successful?
2. Check Network tab in DevTools
3. Look for GET /api/outlets response
4. Backend might not have outlets data

### ❌ "Session keeps clearing"
- Click "🧹 Clear Session (Dev)" button on login page
- Refresh browser
- Login again

### ❌ "Products not showing"
1. Check you're logged in as right user
2. Verify user role (owner/admin/cashier)
3. Test `/api/products` endpoint in Postman

## Testing Checklist

### Authentication ✅
- [ ] Can see Login Page on first load
- [ ] Can login with correct credentials
- [ ] Login shows error with wrong credentials
- [ ] Auto-redirects to dashboard after login
- [ ] Logout works and clears session

### Navigation ✅
- [ ] Can see correct dashboard for user role
- [ ] Can switch between outlets (if applicable)
- [ ] Dashboard data updates when switching outlets

### Products ✅
- [ ] Products display in list
- [ ] Can search/filter products
- [ ] Can view product details
- [ ] Can update product info
- [ ] Can delete products

### Transactions ✅
- [ ] Can add products to cart
- [ ] Can complete checkout
- [ ] Can view transaction history
- [ ] Receipt shows correct total

### Reports ✅
- [ ] Can view sales report
- [ ] Can filter by date range
- [ ] Report shows correct totals
- [ ] Can export/print report

## API Endpoints Summary

### Auth
```
POST /api/auth/login         ← Login
POST /api/auth/register      ← Create account
POST /api/auth/logout        ← Logout
POST /api/auth/verify        ← Check token
```

### Outlets
```
GET  /api/outlets            ← Get all
GET  /api/outlets/{id}       ← Get one
POST /api/outlets            ← Create
PUT  /api/outlets/{id}       ← Update
DEL  /api/outlets/{id}       ← Delete
```

### Products
```
GET  /api/products           ← Get all
GET  /api/products/{id}      ← Get one
GET  /api/products/outlet/{id}  ← By outlet
POST /api/products           ← Create
PUT  /api/products/{id}      ← Update
DEL  /api/products/{id}      ← Delete
```

### Transactions
```
GET  /api/transactions       ← Get all
GET  /api/transactions/{id}  ← Get one
POST /api/transactions       ← Create (checkout)
GET  /api/transactions/outlet/{id}  ← By outlet
```

## Development Tools

### Clear Session Button
Located at bottom of Login Page in development mode:
- Click to clear old session
- Helps when testing login flow
- Only appears in development

### Browser DevTools
```javascript
// Check current auth state
console.log(localStorage.getItem('madura_token'))
console.log(localStorage.getItem('madura_user'))

// Clear everything
localStorage.removeItem('madura_token')
localStorage.removeItem('madura_user')
location.reload()

// View API calls
// Open Network tab → Filter by XHR
```

### Postman Collection
1. Import `postman_collection.json`
2. Set `{{base_url}}` = `http://localhost:5000`
3. Run "Login" request
4. Token auto-saves to `{{auth_token}}`
5. Use for testing individual endpoints

## File Structure

```
src/
├── services/
│   ├── api.ts              ← All API clients
│   ├── authService.ts      ← Auth logic
│   └── outletService.ts    ← Outlet logic
├── hooks/
│   └── index.ts            ← useAuth, useOutlet, etc
├── components/
│   ├── LoginPage.tsx       ← Login form
│   ├── OwnerDashboard.tsx  ← Owner view
│   ├── AdminDashboard.tsx  ← Admin view
│   └── HomePage.tsx        ← Cashier view
└── constants/
    └── api.ts              ← API endpoints
```

## Key Files Modified for Integration

1. **src/constants/api.ts**
   - Base URL: `http://localhost:5000/api`
   - All endpoints match Postman collection

2. **src/services/api.ts**
   - API client with interceptors
   - Token auto-injection
   - Error handling

3. **src/services/authService.ts**
   - Login/register/logout
   - Token validation
   - Session restore

4. **src/hooks/index.ts**
   - useAuth, useOutlet, useProduct, useTransaction
   - Consistent localStorage keys

5. **src/App.tsx**
   - Auth state management
   - Loading state handling
   - Role-based routing

## Production Checklist

Before deploying:

- [ ] Update `REACT_APP_API_URL` to production backend URL
- [ ] Remove development mode clear session button (optional)
- [ ] Test all API endpoints against production
- [ ] Verify token expiration handling
- [ ] Check error messages are user-friendly
- [ ] Test on different browsers
- [ ] Verify CORS is configured correctly
- [ ] Check sensitive data isn't logged

## Support

For issues:
1. Check [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for detailed API docs
2. Check [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) for implementation details
3. Test endpoint in Postman first
4. Check browser console for errors
5. Check Network tab for API responses
6. Review backend logs for server errors

## Links

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: See BACKEND_INTEGRATION.md
- Implementation: See INTEGRATION_COMPLETE.md

---

**Ready to test?** 🚀

```bash
npm start
```

Then login with:
- Email: fikri@madura.com
- Password: fikri123

