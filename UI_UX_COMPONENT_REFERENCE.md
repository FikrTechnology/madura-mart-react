# UI/UX Restoration - Component Reference Guide

## 🎨 Visual Design Reference

### Colors Used Throughout

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #667eea | Gradient start, primary buttons |
| Secondary Purple | #764ba2 | Gradient end, accent elements |
| Background | #f5f5f5 | Page background |
| Text Primary | #333 | Main text |
| Text Secondary | #666 | Subtext, labels |
| Success | #27ae60 | Success messages, valid state |
| Danger | #e74c3c | Errors, delete buttons |
| Warning | #e67e22 | Warning messages |
| Light Gray | #ecf0f1 | Borders, dividers |
| White | #ffffff | Cards, modals, inputs |

### Gradient
```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```
Used on:
- Sidebar background
- Primary buttons
- Login page header
- Dashboard sections

---

## 📱 Responsive Layout

### Desktop Layout (> 1024px)
```
┌────────────────────────────────────┐
│ Sidebar | Header                   │
│         ├───────────────────────┤  │
│ 260px   | Main Content | Cart   │  │
│         │               | 350px │  │
│         ├───────────────────────┤  │
└────────────────────────────────────┘

Sidebar: Fixed, left side, 260px width
Header: Top bar with outlet info
Main Content: Flex, grows to fill
Cart: Fixed right, 350px, scrollable
```

### Tablet Layout (768px - 1024px)
```
┌──────────────────────────┐
│ Hamburger | Header       │
├──────────────────────────┤
│ Main Content             │
│ Cart (below or sidebar)  │
└──────────────────────────┘

Sidebar: Collapsed or overlay
Header: Top navigation
```

### Mobile Layout (< 768px)
```
┌────────────────────┐
│ Menu | Header      │
├────────────────────┤
│ Main Content       │
│ (Full width)       │
│                    │
│ Cart (Tab below)   │
└────────────────────┘

Sidebar: Hidden/Overlay
Header: Mobile optimized
Content: Full width
Navigation: Bottom tabs or menu
```

---

## 🏠 Login Page

### Structure
```
┌─────────────────────────────────┐
│     Left: Form  │  Right: Demo  │
├─────────────────────────────────┤
│ • Logo icon        │ Account 1   │
│ • Title "Login"    │ Account 2   │
│ • Email input      │ Account 3   │
│ • Password input   │             │
│ • Login button     │ Click cards │
│                    │ to fill     │
└─────────────────────────────────┘
```

### Styling Details
```css
/* Container */
Display: Grid (2 columns on desktop)
Background: Gradient or solid
Gap: 40px

/* Left Section */
Width: 50% (desktop) / 100% (mobile)
Flex: Column
Align: Center

/* Logo */
Font-size: 48px
Margin-bottom: 20px

/* Form */
Max-width: 400px
Display: Flex
Flex-direction: Column
Gap: 16px

/* Input Fields */
Height: 44px
Padding: 12px 16px
Border: 1px solid #ddd
Border-radius: 4px
Font-size: 14px
Transition: 0.3s
Focus: Blue border, shadow

/* Button */
Height: 44px
Background: Gradient
Color: White
Font-weight: 600
Border-radius: 4px
Cursor: Pointer
Hover: Lighter shadow

/* Right Section */
Width: 50% (desktop) / 100% (mobile)
Display: Grid (3 columns)
Gap: 12px

/* Demo Account Cards */
Padding: 16px
Border: 2px solid #ddd
Border-radius: 8px
Cursor: Pointer
Transition: 0.3s
Hover: Blue border, shadow
```

---

## 🏠 HomePage (POS Interface)

### Layout Structure
```
┌──────────────────────────────────────────────┐
│ Sidebar          │ Header (Outlet Info)      │
│ 260px            │ Full width - height: 60px │
├──────────────────┼───────────────────────────┤
│                  │ Search Bar                │
│ Navigation       │ Category Filters          │
│ • Home           ├───────────────────────────┤
│ • Products       │ Product Grid (6 columns)  │
│ • Transactions   │ • Cards with image        │
│ • Dashboard      │ • Price/discount          │
│ • Logout         │ • Stock indicator         │
│                  │ • Add to cart button      │
│                  │                           │
│                  ├─────────────────────┐     │
│                  │ Transaction History │ C   │
│                  │ • List of trans.    │ a   │
│                  │ • Timestamps        │ r   │
│                  │                     │ t   │
│                  │                     │     │
│                  │ Sales Report        │ S   │
│                  │ • Charts            │ i   │
│                  │ • Stats             │ d   │
│                  │                     │ e   │
│                  │                     │ b   │
│                  │                     │ a   │
│                  │                     │ r   │
│                  │                     │     │
│                  │                     │ 350 │
│                  │                     │ px  │
│                  │                     │     │
│                  │                     │     │
└──────────────────┴─────────────────────┘     │
```

### Key Elements

#### Sidebar
```
Background: Gradient (#667eea → #764ba2)
Color: White
Width: 260px
Fixed: Yes
Height: 100vh

Components:
• Logo/Branding (top)
• Menu items (middle)
  - Active: Blue background, left border
  - Hover: Lighter background
• Logout button (bottom)
```

#### Header
```
Background: White
Height: 60px
Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
Display: Flex
Align-items: Center
Padding: 0 20px

Content:
• Outlet name (left)
• User menu (right)
  - Profile name
  - Dropdown menu
```

#### Search Bar
```
Max-width: 400px
Height: 40px
Border: 1px solid #ddd
Border-radius: 4px
Padding: 8px 12px
Background: White

Icon: Search icon (left)
Placeholder: "Search products..."
Focus: Blue border
```

#### Product Grid
```
Display: Grid
Grid-template-columns: repeat(6, 1fr)
Gap: 16px
Padding: 20px

Responsive:
Desktop (1440px+): 6 columns
Laptop (1024px): 5 columns
Tablet (768px): 4 columns
Mobile (<768px): 2 columns

Card:
• Image (200px height, cover)
• Padding: 12px
• Name (truncate 2 lines)
• Price (large, bold)
• Discount (if any)
• Stock indicator
  - Green: In stock
  - Red: Out of stock
• Add button (full width)
```

#### Cart Sidebar
```
Width: 350px
Position: Fixed right
Height: 100vh
Background: White
Border-left: 1px solid #ddd
Overflow-y: Auto

Sections:
1. Cart Items (top)
   • Product name
   • Quantity
   • Unit price
   • Total price
   • Remove button

2. Summary (middle)
   • Subtotal
   • Tax (10%)
   • Total
   • Discount (if any)

3. Payment Method (below)
   • Cash
   • Card
   • Transfer

4. Checkout Button (bottom)
   • Full width
   • Gradient background
   • Fixed at bottom
```

---

## 🔐 Sidebar Navigation

### Menu Structure
```
Sidebar
├── Logo/Brand (top)
│   └── Madura Mart
│
├── Main Menu
│   ├── Home (dashboard icon)
│   ├── Products (shopping bag icon)
│   ├── Transactions (receipt icon)
│   ├── Employees (people icon)
│   └── Analytics (chart icon)
│
└── User Menu (bottom)
    ├── Profile
    └── Logout
```

### Styling
```
Background: linear-gradient(135deg, #667eea, #764ba2)
Text Color: White
Width: 260px
Padding: 20px 0

Logo Section:
• Font-size: 24px
• Font-weight: 600
• Text-align: Center
• Margin-bottom: 30px

Menu Item:
• Height: 48px
• Padding: 0 20px
• Display: Flex
• Align-items: Center
• Gap: 12px
• Cursor: Pointer
• Transition: 0.2s

Menu Item Hover:
• Background: rgba(255,255,255,0.1)
• Left-border: 4px solid white

Menu Item Active:
• Background: rgba(255,255,255,0.2)
• Left-border: 4px solid white
• Font-weight: 600
```

---

## 🛒 Cart Sidebar Details

### Items Section
```
Each Item:
┌─────────────────────────┐
│ Product Name        [x] │ (x = remove)
│ Qty: [−] 1 [+]   $50.00│
│ Subtotal: $50.00       │
└─────────────────────────┘

Item Styling:
• Padding: 12px
• Border-bottom: 1px solid #eee
• Display: Flex
• Justify-content: Space-between
• Align-items: Center

Qty Controls:
• Button width: 32px
• Button height: 32px
• Border: 1px solid #ddd
• Cursor: Pointer
• Hover: Blue background
```

### Summary Section
```
┌─────────────────────────┐
│ Subtotal: ........$XXX  │
│ Tax (10%): ........$XX  │
│ Discount: ........-$XX  │
├─────────────────────────┤
│ Total: .........$XXX    │
└─────────────────────────┘

Styling:
• Padding: 16px
• Background: #f9f9f9
• Font-weight: 500
• Display: Flex
• Justify-content: Space-between
```

---

## 📊 Dashboard Pages

### Admin Dashboard
```
┌────────────────────────────────────┐
│ Dashboard Title                    │
├────────────────────────────────────┤
│ [KPI Card] [KPI Card] [KPI Card]   │
│ Total Sales | Transactions | Inv.  │
├────────────────────────────────────┤
│ Recent Transactions (Table)        │
│ • Date | Product | Amount | Status │
├────────────────────────────────────┤
│ Top Products (Chart)               │
│ • Bar chart showing sales          │
└────────────────────────────────────┘
```

### Owner Dashboard
```
┌────────────────────────────────────┐
│ Dashboard Title + Date Range       │
├────────────────────────────────────┤
│ [Outlet] [Outlet] [Outlet]         │
│ Card 1    Card 2    Card 3         │
├────────────────────────────────────┤
│ Low Stock Warnings (Alert List)    │
├────────────────────────────────────┤
│ Comparative Analytics (Chart)      │
└────────────────────────────────────┘
```

### KPI Card
```
┌──────────────────┐
│ Title            │
│ Rp 10.000.000    │ (Large number)
│ +12% vs last mo. │ (Subtitle)
└──────────────────┘

Styling:
• Padding: 20px
• Background: White
• Border-radius: 8px
• Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
• Text-align: Center
```

---

## ⚠️ AlertModal

### Structure
```
┌─────────────────────────────────┐
│ × [Close Button]                │
├─────────────────────────────────┤
│ ⚠️  Warning Title               │
│                                 │
│ This is the warning message     │
│ explaining what happened        │
│                                 │
│ [Cancel] [Confirm]              │
└─────────────────────────────────┘
```

### Styling
```
Overlay:
• Position: Fixed (full screen)
• Background: rgba(0,0,0,0.5)
• Display: Flex
• Align-items: Center
• Justify-content: Center
• Z-index: 1000

Modal:
• Background: White
• Width: 400px
• Padding: 24px
• Border-radius: 8px
• Box-shadow: 0 4px 12px rgba(0,0,0,0.15)

Title:
• Font-size: 18px
• Font-weight: 600
• Color: #333
• Margin-bottom: 12px

Message:
• Font-size: 14px
• Color: #666
• Line-height: 1.6
• Margin-bottom: 20px

Buttons:
• Display: Flex
• Gap: 12px
• Justify-content: Flex-end
```

---

## 🎯 Buttons

### Button Types

#### Primary Button
```
Background: linear-gradient(135deg, #667eea, #764ba2)
Color: White
Padding: 10px 24px
Border-radius: 4px
Font-weight: 600
Hover: Shadow, slight lighter
Active: Darker shade
```

#### Secondary Button
```
Background: #f0f0f0
Color: #333
Padding: 10px 24px
Border-radius: 4px
Font-weight: 600
Hover: #e0e0e0
```

#### Danger Button
```
Background: #e74c3c
Color: White
Padding: 10px 24px
Border-radius: 4px
Font-weight: 600
Hover: #c0392b
```

#### Success Button
```
Background: #27ae60
Color: White
Padding: 10px 24px
Border-radius: 4px
Font-weight: 600
Hover: #229954
```

---

## 📋 Forms

### Input Fields
```
Height: 44px
Padding: 10px 12px
Border: 1px solid #ddd
Border-radius: 4px
Font-size: 14px
Font-family: Inherit
Transition: border 0.2s

States:
Normal: Border #ddd
Focus: Border #667eea, box-shadow: 0 0 0 2px rgba(102,126,234,0.1)
Disabled: Opacity 0.6, cursor not-allowed
Error: Border #e74c3c

Placeholder:
Color: #999
```

### Select Dropdown
```
Same as input field
Appearance: None (custom)
Arrow: CSS ::after pseudo-element
```

### Textarea
```
Same as input field
Min-height: 100px
Resize: Vertical
Font-family: Monospace
```

---

## 🔤 Typography

### Font Scale
```
H1: 32px, 700 (bold)
H2: 24px, 600 (semibold)
H3: 20px, 600
H4: 18px, 600
H5: 16px, 600
H6: 14px, 600

Body: 14px, 400
Body Large: 16px, 400
Body Small: 12px, 400

Monospace: 13px, 400 (for code)
```

### Font Family
```
Primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
Fallback: System fonts
Code: 'Courier New', monospace
```

---

## 📏 Spacing Scale

```
4px   (xs)
8px   (sm)
12px  (xs)
16px  (md) ← Most common
20px
24px  (lg)
32px  (xl)
40px
48px  (2xl)
```

Used for:
- Padding/margin on components
- Gaps between elements
- Line-height for text

---

## 🎬 Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
Duration: 0.3s
Timing: ease-in-out
```

### Slide In
```css
@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
Duration: 0.3s
Timing: ease-out
```

### Applied To:
- Modal entry
- Page transitions
- Component mount
- Button hover states

---

## 🔗 CSS Files Map

```
src/styles/
├── App.css               (216 lines) - Global styles
├── index.css             (10 lines) - Typography
├── Login.css             (615 lines) - Login page
├── Sidebar.css           (278 lines) - Navigation sidebar
├── Home.css              (4292 lines) - POS interface
├── Cart.css              (+) - Cart sidebar
├── ProductCard.css       (+) - Product cards
├── ProductManagement.css (+) - Product list
├── AlertModal.css        (+) - Modal dialogs
├── AdminDashboard.css    (+) - Admin dashboard
└── OwnerDashboard.css    (+) - Owner dashboard
```

Each file contains complete styling for its component with:
- Base styles
- Layout (flex/grid)
- States (hover, active, disabled)
- Responsive media queries
- Animations
- Dark mode (if applicable)

---

## ✅ Verification Checklist

When you open http://localhost:3000:

### Visual Checks
- [ ] Login page shows gradient background
- [ ] Form is centered and properly styled
- [ ] Demo account cards are visible
- [ ] Login button has gradient
- [ ] After login, sidebar appears on left
- [ ] Sidebar has gradient background
- [ ] Navigation items are readable
- [ ] Product grid shows 6 columns (desktop)
- [ ] Product cards display image, name, price
- [ ] Cart sidebar visible on right
- [ ] Colors match (purple/blue gradients)

### Functional Checks
- [ ] Hover effects on buttons work
- [ ] Hover effects on cards work
- [ ] Form inputs accept typing
- [ ] Buttons are clickable
- [ ] Links navigate correctly
- [ ] Cart updates work
- [ ] Responsive on mobile (try resizing)

### CSS Checks
- [ ] No "Failed to load" errors in console
- [ ] No red X on CSS in Network tab
- [ ] Inspect element shows CSS rules
- [ ] Colors match the color palette

---

**This guide serves as reference for the restored UI/UX. Everything should look and function exactly as before the TypeScript migration!**
