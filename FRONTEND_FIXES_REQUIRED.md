# Frontend Hook Fixes Required - Quick Action Guide

## Overview
There are 5 breaking changes in `src/hooks/index.ts` that need to be fixed due to API alignment with Postman Collection.

---

## Fix #1: Remove `authAPI.register()` or implement backend endpoint

**Location:** [src/hooks/index.ts](src/hooks/index.ts#L70)  
**Error:** `Property 'register' does not exist on type authAPI`

```typescript
// ❌ CURRENT (LINE 70)
const response = await authAPI.register(email, name, password);

// ✅ SOLUTION 1: Remove if registration isn't supported by backend
// Delete the authAPI.register() call

// ✅ SOLUTION 2: Implement if backend has registration endpoint
// Add to authAPI in src/services/api.ts:
export const authAPI = {
  // ... existing methods ...
  register: async (email: string, name: string, password: string) => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', {
      email,
      name,
      password
    });
    return response.data;
  },
};
```

**Recommended:** Check with backend if registration endpoint exists. If not, remove this call from code.

---

## Fix #2: Replace `productAPI.getByOutlet()` with `getAll()`

**Location:** [src/hooks/index.ts](src/hooks/index.ts#L181)  
**Error:** `Property 'getByOutlet' does not exist on type productAPI`

```typescript
// ❌ CURRENT (LINE 181)
const response = await productAPI.getByOutlet(outletId);

// ✅ UPDATED
const response = await productAPI.getAll({ outletId });
```

**Note:** The `productAPI.getAll()` method accepts a params object that includes `outletId` for filtering.

---

## Fix #3: Update `productAPI.updateStock()` signature

**Location:** [src/hooks/index.ts](src/hooks/index.ts#L197)  
**Error:** `Argument of type 'number' is not assignable to parameter of type '{ quantity: number; type?: ... }'`

```typescript
// ❌ CURRENT (LINE 197)
const response = await productAPI.updateStock(productId, quantity);

// ✅ UPDATED - Include type parameter
const response = await productAPI.updateStock(productId, { 
  quantity,
  type: 'set'  // or 'add' or 'subtract' depending on your use case
});
```

**Type Options:**
- `'set'` - Set stock to exact quantity
- `'add'` - Add to current stock
- `'subtract'` - Subtract from current stock

---

## Fix #4: Ensure payment method validation uses correct values

**Location:** [src/hooks/index.ts](src/hooks/index.ts#L287)  
**Error:** `Type 'string' is not assignable to type '"transfer" | "tunai" | "e-wallet"'`

```typescript
// ❌ CURRENT (LINE 287) - Possible issue
// Using any string value for payment_method

// ✅ UPDATED - Validate payment method before sending
const validPaymentMethods = ['tunai', 'transfer', 'e-wallet'] as const;

if (!validPaymentMethods.includes(paymentMethod as any)) {
  throw new Error(`Invalid payment method: ${paymentMethod}`);
}

// Then use in transaction creation:
const response = await transactionAPI.create({
  outlet_id: outletId,
  payment_method: paymentMethod as 'tunai' | 'transfer' | 'e-wallet',
  items: cartItems,
  // ... other fields
});
```

**Valid Payment Methods:**
- `'tunai'` (Cash)
- `'transfer'` (Bank Transfer)
- `'e-wallet'` (E-Wallet)

**Update UI dropdown/selection** to only show these three options:
```typescript
const paymentOptions = [
  { value: 'tunai', label: 'Tunai (Cash)' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'e-wallet', label: 'E-Wallet' }
];
```

---

## Fix #5: Replace `userAPI.getByOutlet()` with `getAll()`

**Location:** [src/hooks/index.ts](src/hooks/index.ts#L355)  
**Error:** `Property 'getByOutlet' does not exist on type userAPI`

```typescript
// ❌ CURRENT (LINE 355)
const response = await userAPI.getByOutlet(outletId);

// ✅ UPDATED
const response = await userAPI.getAll({ outlet_id: outletId });
```

**Note:** Use `outlet_id` (with underscore) when filtering users by outlet.

---

## Priority & Impact

| Fix | Priority | Impact | Type |
|-----|----------|--------|------|
| #1: authAPI.register() | LOW | Only if registration feature exists | Check Backend |
| #2: productAPI.getByOutlet() | HIGH | Product filtering | Find & Replace |
| #3: productAPI.updateStock() | HIGH | Stock management | Update Signature |
| #4: Payment method validation | CRITICAL | Checkout flow | Validation Logic |
| #5: userAPI.getByOutlet() | HIGH | User filtering | Find & Replace |

---

## Implementation Checklist

- [ ] Fix #1: Handle `authAPI.register()` (check if endpoint exists)
- [ ] Fix #2: Replace all `productAPI.getByOutlet(outletId)` with `productAPI.getAll({ outletId })`
- [ ] Fix #3: Update all `productAPI.updateStock(id, qty)` calls to `productAPI.updateStock(id, { quantity: qty, type: 'set' })`
- [ ] Fix #4: Update payment method values from old to new enum
- [ ] Fix #5: Replace all `userAPI.getByOutlet(outletId)` with `userAPI.getAll({ outlet_id: outletId })`
- [ ] Verify TypeScript compilation succeeds
- [ ] Update UI payment method selector dropdown
- [ ] Test all affected features

---

## Quick Find & Replace

Use VS Code Find & Replace to speed up fixes:

### Find #2: Product By Outlet
**Find:** `productAPI.getByOutlet(`  
**Replace:** `productAPI.getAll({ outletId: `  
**Note:** You'll need to adjust each occurrence slightly

### Find #5: User By Outlet
**Find:** `userAPI.getByOutlet(`  
**Replace:** `userAPI.getAll({ outlet_id: `

---

## Testing After Fixes

```typescript
// Test that these compile without errors:
productAPI.getAll({ outletId: 'outlet-123' })
productAPI.updateStock('prod-1', { quantity: 10, type: 'set' })
userAPI.getAll({ outlet_id: 'outlet-123' })
transactionAPI.create({
  outlet_id: 'outlet-1',
  payment_method: 'tunai',  // Valid
  items: [],
})
```

---

## Files to Update

1. **`src/hooks/index.ts`** - Main file with all 5 errors
2. **`src/components/OwnerDashboard.tsx`** - May have payment method UI
3. **`src/components/Cart.tsx`** - May have payment method selector
4. **`src/components/ProductManagement.tsx`** - May use product API calls
5. **Any other component** using the old API method names

---

## Before You Continue

After fixing these 5 issues:

1. All TypeScript compilation errors will be resolved ✅
2. Frontend will be ready for backend integration testing ✅
3. Dashboard endpoints will be available for components to use ✅

Then proceed with:
- Updating dashboard components to use `dashboardAPI.*`
- Testing API connectivity with actual backend
- Verifying all features work end-to-end
