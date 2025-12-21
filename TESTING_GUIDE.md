# 🧪 Testing Guide - Frontend-Backend Integration

## Pre-Test Setup

### 1. Ensure Backend is Running
```bash
# Terminal 1
cd madura-mart-backend
npm start
# Should output: Server running on port 5000
```

### 2. Start Frontend
```bash
# Terminal 2
cd madura-mart-react
npm start
# Should open http://localhost:3000 in browser
```

### 3. Clear Previous Session
- Open http://localhost:3000
- You should see Login Page
- If not, click "🧹 Clear Session (Dev)" button
- Refresh page

## Test Suite

### A. Authentication Tests

#### Test A1: Login with Valid Credentials
**Steps:**
1. Enter email: `fikri@madura.com`
2. Enter password: `fikri123`
3. Click "Login" button

**Expected Results:**
- ✅ "Loading..." appears briefly
- ✅ No error message shown
- ✅ Page redirects to Owner Dashboard
- ✅ "Fikri" name appears in dashboard header

**How to Verify:**
```javascript
// In browser console
localStorage.getItem('madura_token')  // Should have a long JWT string
localStorage.getItem('madura_user')   // Should have user object
```

---

#### Test A2: Login with Invalid Credentials
**Steps:**
1. Enter email: `invalid@example.com`
2. Enter password: `wrongpassword`
3. Click "Login" button

**Expected Results:**
- ✅ Error message appears
- ✅ Page stays on login form
- ✅ No token in localStorage
- ✅ No redirect occurs

**How to Verify:**
```javascript
// In browser console
localStorage.getItem('madura_token')  // Should be null
```

---

#### Test A3: Admin Login
**Steps:**
1. Clear session
2. Enter email: `admin@outlet1.com`
3. Enter password: `admin123`
4. Click "Login" button

**Expected Results:**
- ✅ Redirects to Admin Dashboard
- ✅ Admin-specific features visible
- ✅ Role shows as "admin"

---

#### Test A4: Cashier Login
**Steps:**
1. Clear session
2. Enter email: `cashier@outlet1.com`
3. Enter password: `cashier123`
4. Click "Login" button

**Expected Results:**
- ✅ Redirects to Home Page (Cashier view)
- ✅ Cashier can see products and checkout
- ✅ Role shows as "cashier"

---

#### Test A5: Logout
**Steps:**
1. Login successfully
2. Find logout button in dashboard header
3. Click logout button

**Expected Results:**
- ✅ Session cleared from localStorage
- ✅ Redirected to Login Page
- ✅ No cached data remains

**How to Verify:**
```javascript
// In browser console
localStorage.getItem('madura_token')  // Should be null
localStorage.getItem('madura_user')   // Should be null
```

---

#### Test A6: Session Persistence
**Steps:**
1. Login successfully
2. Close browser tab
3. Open http://localhost:3000 again

**Expected Results:**
- ✅ Logs back in automatically
- ✅ Shows dashboard (no login page)
- ✅ Same user data preserved

---

#### Test A7: Session Expiration
**Steps:**
1. Login successfully
2. Open browser DevTools → Application → Local Storage
3. Find `madura_token`
4. Clear the value manually
5. Try to perform an action (click a button, navigate)

**Expected Results:**
- ✅ Gets logged out automatically
- ✅ Redirected to Login Page
- ✅ Can login again

---

### B. Outlets Management Tests

#### Test B1: View All Outlets
**Steps:**
1. Login as Owner
2. Look at dashboard sidebar

**Expected Results:**
- ✅ Sidebar shows list of outlets
- ✅ Each outlet has a name
- ✅ Can click to switch outlet

**How to Verify:**
```javascript
// In browser console
localStorage.getItem('madura_outlets')  // Should have outlet data
```

---

#### Test B2: Switch Outlet
**Steps:**
1. Login as Owner
2. Click different outlet in sidebar
3. Observe dashboard changes

**Expected Results:**
- ✅ Selected outlet highlights
- ✅ Dashboard data updates for new outlet
- ✅ Products shown are from new outlet

---

#### Test B3: View Outlet Details
**Steps:**
1. Login as Owner
2. Navigate to Outlet Management section
3. Click an outlet

**Expected Results:**
- ✅ Shows outlet details (name, address, phone)
- ✅ Shows employees assigned to outlet
- ✅ Can edit outlet info

---

### C. Products Management Tests

#### Test C1: View All Products
**Steps:**
1. Login as Owner/Admin/Cashier
2. Look at main product area

**Expected Results:**
- ✅ Products display in grid/list
- ✅ Each product shows: name, price, stock
- ✅ Product images load correctly

**How to Verify:**
```javascript
// In browser console
// Check network tab → should see GET /api/products
// Response should include product array
```

---

#### Test C2: Filter Products by Outlet
**Steps:**
1. Login as Owner
2. Switch to different outlet
3. Observe products list

**Expected Results:**
- ✅ Products change for the outlet
- ✅ Only outlet's products show
- ✅ No products from other outlets

---

#### Test C3: Search Products
**Steps:**
1. Look at products list
2. Find search bar
3. Type product name (e.g., "Beras")

**Expected Results:**
- ✅ Products filter by search term
- ✅ Matching products only shown
- ✅ Clear search shows all again

---

#### Test C4: Create New Product
**Steps:**
1. Login as Owner/Admin
2. Click "Add Product" button
3. Fill in product details:
   - Name: "Test Product"
   - Price: 50000
   - Stock: 100
   - Category: "Test"
4. Click "Save"

**Expected Results:**
- ✅ Product added to list
- ✅ Shows in next product listing
- ✅ Can be edited immediately

**Network Check:**
```
POST /api/products (201 Created)
Response: { success: true, data: { id: "...", name: "Test Product" } }
```

---

#### Test C5: Update Product
**Steps:**
1. Click on a product to edit
2. Change price from 75000 to 80000
3. Click "Save"

**Expected Results:**
- ✅ Price updates immediately
- ✅ Backend received the change
- ✅ Refresh page still shows new price

**Network Check:**
```
PUT /api/products/{id} (200 OK)
```

---

#### Test C6: Update Product Stock
**Steps:**
1. Find a product
2. Look for stock management option
3. Change quantity (e.g., from 25 to 20)
4. Confirm

**Expected Results:**
- ✅ Stock number updates
- ✅ Changes persist after refresh
- ✅ Low stock warnings appear if stock < threshold

**Network Check:**
```
PUT /api/products/{id}/stock (200 OK)
Body: { quantity: -5, action: "out" }
```

---

#### Test C7: Delete Product
**Steps:**
1. Click delete on a product
2. Confirm deletion

**Expected Results:**
- ✅ Product removed from list
- ✅ Doesn't reappear after refresh
- ✅ No error messages

**Network Check:**
```
DELETE /api/products/{id} (200 OK)
```

---

### D. Transactions/Checkout Tests

#### Test D1: Add Products to Cart
**Steps:**
1. Login as Cashier
2. Click "Add to Cart" on products
3. Add 2-3 different products

**Expected Results:**
- ✅ Cart updates with items
- ✅ Shows item count
- ✅ Total price calculates
- ✅ Stock decreases show

---

#### Test D2: Complete Checkout
**Steps:**
1. Add products to cart
2. Enter customer name (optional)
3. Select payment method (Cash/Card/etc)
4. Click "Checkout" button

**Expected Results:**
- ✅ Transaction created successfully
- ✅ Shows receipt number
- ✅ Cart clears
- ✅ Stock updates in backend

**Network Check:**
```
POST /api/transactions (201 Created)
Response: { success: true, data: { id: "...", receipt_number: "..." } }
```

---

#### Test D3: View Transaction History
**Steps:**
1. Login as Owner/Admin
2. Navigate to Transactions section
3. View list of past transactions

**Expected Results:**
- ✅ Shows all transactions
- ✅ Shows receipt number, date, total
- ✅ Can filter by date range
- ✅ Can search by receipt

---

#### Test D4: View Transaction Details
**Steps:**
1. Click on a transaction in list
2. View details

**Expected Results:**
- ✅ Shows all items in transaction
- ✅ Shows payment method
- ✅ Shows totals with discounts/tax
- ✅ Can print or export receipt

---

### E. Reports Tests

#### Test E1: View Daily Sales
**Steps:**
1. Login as Owner
2. Go to Reports section
3. Select "Daily" view

**Expected Results:**
- ✅ Shows today's sales
- ✅ Shows total revenue
- ✅ Shows transaction count
- ✅ Shows average transaction value

**Network Check:**
```
GET /api/transactions/report/{outletId}?startDate=...&endDate=... (200 OK)
```

---

#### Test E2: View Monthly Sales
**Steps:**
1. Go to Reports section
2. Select "Monthly" view

**Expected Results:**
- ✅ Shows current month sales
- ✅ Shows breakdown by week
- ✅ Shows top products
- ✅ Shows revenue trends

---

#### Test E3: Filter Report by Date Range
**Steps:**
1. Go to Reports
2. Select custom date range
3. Pick start and end date
4. Apply filter

**Expected Results:**
- ✅ Report updates with new date range
- ✅ Shows only transactions in range
- ✅ Totals recalculate correctly

---

### F. Error Handling Tests

#### Test F1: Network Error
**Steps:**
1. Stop backend server
2. Try to perform action (logout, refresh, etc)
3. Observe error handling

**Expected Results:**
- ✅ Shows error message
- ✅ Doesn't crash application
- ✅ Can retry operation
- ✅ Logs error in console

---

#### Test F2: Validation Error
**Steps:**
1. Try to create product with invalid data
2. Leave required field empty
3. Submit form

**Expected Results:**
- ✅ Shows validation error
- ✅ Highlights invalid field
- ✅ Suggests correction
- ✅ Can't submit until fixed

---

#### Test F3: Unauthorized Access
**Steps:**
1. Login as Cashier
2. Try to access Admin features (e.g., change outlet settings)

**Expected Results:**
- ✅ Feature disabled or hidden
- ✅ Shows "Access Denied" message
- ✅ Redirected to allowed page

---

#### Test F4: Token Expiration Error
**Steps:**
1. Login successfully
2. Wait for token to expire (or mock expiration)
3. Try to perform action

**Expected Results:**
- ✅ Auto-logout triggered
- ✅ Redirected to Login Page
- ✅ No error message (graceful)
- ✅ Can login again

---

### G. Performance Tests

#### Test G1: Large Dataset Load
**Steps:**
1. Load page with many products (100+)
2. Observe performance

**Expected Results:**
- ✅ Page loads in < 3 seconds
- ✅ Scrolling is smooth
- ✅ Search works quickly
- ✅ No memory leaks

---

#### Test G2: Rapid API Calls
**Steps:**
1. Quickly switch between outlets
2. Rapidly add/remove products from cart

**Expected Results:**
- ✅ No duplicate requests
- ✅ UI stays responsive
- ✅ Data stays consistent

---

### H. Browser Compatibility Tests

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome

**Test:**
1. Login
2. Navigate all features
3. Perform checkout
4. Check console for errors

**Expected Results:**
- ✅ No errors in console
- ✅ All features work
- ✅ Responsive layout works
- ✅ Touch events work (mobile)

---

## Test Automation

### Using Postman for API Tests

1. Import `postman_collection.json`
2. Set up Postman environment:
   ```json
   {
     "base_url": "http://localhost:5000",
     "auth_token": ""
   }
   ```

3. Run tests:
   - Login first (auto-sets token)
   - Run other endpoints
   - Check responses

### Using Browser DevTools

```javascript
// Check API responses in Network tab
// Filter by: XHR
// For each request, verify:
// - Status: 200 or 201
// - Response: Matches expected format
// - Time: < 1000ms

// Check localStorage
console.table(JSON.parse(localStorage.getItem('madura_user')))
console.log(localStorage.getItem('madura_token').substring(0, 20) + '...')
```

---

## Test Results Template

```
Test Suite: [Suite Name]
Date: [Date]
Tester: [Name]
Backend Version: [Version]
Frontend Version: [Version]

Results:
- [ ] Test A1: ✅ PASS / ❌ FAIL / ⚠️ SKIP
- [ ] Test A2: ✅ PASS / ❌ FAIL / ⚠️ SKIP
...

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Any additional observations]
```

---

## Debugging Tips

### Check Browser Console
```javascript
// View all localStorage
Object.keys(localStorage)

// View specific value
localStorage.getItem('madura_token')

// Clear everything
localStorage.clear()
localStorage.setItem('madura_token', 'new_token')
```

### Check Network Tab
1. Open DevTools → Network
2. Filter by XHR (XMLHttpRequest)
3. Click on request
4. View:
   - Headers (authorization token)
   - Payload (request body)
   - Response (server response)
   - Timing (how long took)

### Check Backend Logs
```bash
# In backend terminal, should show:
[INFO] GET /api/products - 200 - 234ms
[INFO] POST /api/transactions - 201 - 156ms
[ERROR] POST /api/auth/login - 401 - Invalid credentials
```

---

## Success Criteria

✅ All tests must pass before production:
- Authentication complete and secure
- All API endpoints responding correctly
- Data persists across page refreshes
- Proper error handling in all scenarios
- Performance acceptable (<3s page load)
- Works on target browsers
- No console errors
- Graceful degradation on errors

---

**Ready to test?** Start with [Quick Start Guide](./QUICK_START_INTEGRATION.md)

