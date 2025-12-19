import React, { createContext, useContext, useState } from 'react';

const OutletContext = createContext();

export const OutletProvider = ({ children }) => {
  // Current user dan outlet yang sedang digunakan
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOutlet, setCurrentOutlet] = useState(null);
  
  // List outlets yang available untuk user
  const [userOutlets, setUserOutlets] = useState([]);

  // Mock outlets data - in production, ini dari backend
  const mockOutlets = [
    {
      id: 'outlet_001',
      name: 'Toko Madura - Sidoarjo',
      owner: 'Fikri',
      address: 'Jl. Madura No. 123, Sidoarjo',
      phone: '0812-3456-7890'
    },
    {
      id: 'outlet_002',
      name: 'Toko Madura - Surabaya',
      owner: 'Fikri',
      address: 'Jl. Surabaya No. 456, Surabaya',
      phone: '0813-9876-5432'
    },
    {
      id: 'outlet_003',
      name: 'Toko Madura - Malang',
      owner: 'Fikri',
      address: 'Jl. Malang No. 789, Malang',
      phone: '0814-1111-2222'
    }
  ];

  // Mock users - in production, ini dari backend
  const mockUsers = [
    {
      id: 'user_001',
      email: 'fikri@madura.com',
      password: 'fikri123',
      name: 'Fikri (Owner)',
      role: 'owner',
      outlets: ['outlet_001', 'outlet_002', 'outlet_003'] // Owner bisa akses semua
    },
    {
      id: 'user_002',
      email: 'admin@outlet1.com',
      password: 'admin123',
      name: 'Admin Outlet 1',
      role: 'admin',
      outlets: ['outlet_001'] // Admin hanya outlet 1
    },
    {
      id: 'user_003',
      email: 'admin@outlet2.com',
      password: 'admin123',
      name: 'Admin Outlet 2',
      role: 'admin',
      outlets: ['outlet_002'] // Admin hanya outlet 2
    },
    {
      id: 'user_004',
      email: 'cashier@outlet1.com',
      password: 'cashier123',
      name: 'Cashier Outlet 1',
      role: 'cashier',
      outlets: ['outlet_001'] // Cashier hanya outlet 1
    }
  ];

  const login = (email, password) => {
    // First try to find user in mockUsers (owner/default users)
    let user = mockUsers.find(u => u.email === email && u.password === password);
    
    // If not found in mock, check localStorage for dynamically created employees
    if (!user) {
      const employees = JSON.parse(localStorage.getItem('madura_employees') || '[]');
      const employee = employees.find(e => e.email === email && e.password === password && (e.status || 'active') === 'active');
      
      if (employee) {
        // Create user object from employee
        user = {
          id: employee.id,
          email: employee.email,
          password: employee.password,
          name: employee.name,
          role: employee.role,
          outlets: employee.outlet_ids || [employee.outlet_id]
        };
      }
    }
    
    if (!user) {
      throw new Error('Email atau password salah');
    }

    // Get outlets from localStorage first, fallback to mockOutlets
    const storedOutlets = JSON.parse(localStorage.getItem('madura_outlets') || '[]');
    const allOutlets = storedOutlets.length > 0 ? storedOutlets : mockOutlets;
    
    // Ambil outlets yang accessible oleh user (filter only active outlets)
    const outlets = allOutlets.filter(o => 
      user.outlets.includes(o.id) && (o.status || 'active') === 'active'
    );
    
    if (outlets.length === 0) {
      throw new Error('User tidak memiliki akses ke outlet aktif manapun');
    }

    setCurrentUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    setUserOutlets(outlets);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      outlets: outlets
    };
  };

  const selectOutlet = (outletId, outletsList) => {
    // Use provided outletsList if available (untuk avoid race condition)
    const outletsToSearch = outletsList || userOutlets;
    const outlet = outletsToSearch.find(o => o.id === outletId);
    
    if (!outlet) {
      throw new Error('Outlet tidak ditemukan atau tidak accessible');
    }

    setCurrentOutlet(outlet);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOutlet(null);
    setUserOutlets([]);
  };

  const value = {
    currentUser,
    currentOutlet,
    userOutlets,
    login,
    selectOutlet,
    logout,
    mockOutlets,
    mockUsers
  };

  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
};

export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlet harus digunakan dalam OutletProvider');
  }
  return context;
};
