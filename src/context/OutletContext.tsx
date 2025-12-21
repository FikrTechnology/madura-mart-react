// ==========================================
// Outlet Context
// Global state management untuk outlet dan user
// ==========================================
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from 'react';
import { User, Outlet, UserRole } from '../types';

interface LoginResponse {
  user: Omit<User, 'password'>;
  outlets: Outlet[];
}

interface OutletContextType {
  currentUser: Omit<User, 'password'> | null;
  currentOutlet: Outlet | null;
  userOutlets: Outlet[];
  login: (email: string, password: string) => LoginResponse;
  selectOutlet: (outletId: string, outletsList?: Outlet[]) => void;
  logout: () => void;
  mockOutlets: Outlet[];
  mockUsers: Omit<User, 'password'>[];
}

// Create context dengan default undefined untuk runtime check
const OutletContext = createContext<OutletContextType | undefined>(undefined);

interface OutletProviderProps {
  children: ReactNode;
}

/**
 * Provider component untuk global outlet dan user state management
 */
export const OutletProvider: FC<OutletProviderProps> = ({ children }) => {
  // Current user dan outlet yang sedang digunakan
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(
    null
  );
  const [currentOutlet, setCurrentOutlet] = useState<Outlet | null>(null);

  // List outlets yang available untuk user
  const [userOutlets, setUserOutlets] = useState<Outlet[]>([]);

  // Mock outlets data - in production, ini dari backend
  const mockOutlets: Outlet[] = [
    {
      id: 'outlet_001',
      name: 'Toko Madura - Sidoarjo',
      owner: 'Fikri',
      address: 'Jl. Madura No. 123, Sidoarjo',
      phone: '0812-3456-7890',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'outlet_002',
      name: 'Toko Madura - Surabaya',
      owner: 'Fikri',
      address: 'Jl. Surabaya No. 456, Surabaya',
      phone: '0813-9876-5432',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'outlet_003',
      name: 'Toko Madura - Malang',
      owner: 'Fikri',
      address: 'Jl. Malang No. 789, Malang',
      phone: '0814-1111-2222',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Mock users - in production, ini dari backend
  const mockUsers: Omit<User, 'password'>[] = [
    {
      id: 'user_001',
      email: 'fikri@madura.com',
      name: 'Fikri (Owner)',
      role: 'owner' as UserRole,
      outlets: ['outlet_001', 'outlet_002', 'outlet_003'],
    },
    {
      id: 'user_002',
      email: 'admin@outlet1.com',
      name: 'Admin Outlet 1',
      role: 'admin' as UserRole,
      outlets: ['outlet_001'],
    },
    {
      id: 'user_003',
      email: 'admin@outlet2.com',
      name: 'Admin Outlet 2',
      role: 'admin' as UserRole,
      outlets: ['outlet_002'],
    },
    {
      id: 'user_004',
      email: 'cashier@outlet1.com',
      name: 'Cashier Outlet 1',
      role: 'cashier' as UserRole,
      outlets: ['outlet_001'],
    },
  ];

  /**
   * Login dengan email dan password
   */
  const login = (email: string, password: string): LoginResponse => {
    // First try to find user in mockUsers (owner/default users)
    // Create a temporary user object with password for comparison
    const mockUsersWithPassword: any[] = [
      {
        id: 'user_001',
        email: 'fikri@madura.com',
        password: 'fikri123',
        name: 'Fikri (Owner)',
        role: 'owner',
        outlets: ['outlet_001', 'outlet_002', 'outlet_003'],
      },
      {
        id: 'user_002',
        email: 'admin@outlet1.com',
        password: 'admin123',
        name: 'Admin Outlet 1',
        role: 'admin',
        outlets: ['outlet_001'],
      },
      {
        id: 'user_003',
        email: 'admin@outlet2.com',
        password: 'admin123',
        name: 'Admin Outlet 2',
        role: 'admin',
        outlets: ['outlet_002'],
      },
      {
        id: 'user_004',
        email: 'cashier@outlet1.com',
        password: 'cashier123',
        name: 'Cashier Outlet 1',
        role: 'cashier',
        outlets: ['outlet_001'],
      },
    ];

    let user = mockUsersWithPassword.find(
      (u) => u.email === email && u.password === password
    );

    // If not found in mock, check localStorage for dynamically created employees
    if (!user) {
      const employees: any[] = JSON.parse(
        localStorage.getItem('madura_employees') || '[]'
      );
      const employee = employees.find(
        (e: any) =>
          e.email === email &&
          e.password === password &&
          (e.status || 'active') === 'active'
      );

      if (employee) {
        user = {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role as UserRole,
          outlets: employee.outlet_ids || [employee.outlet_id],
        };
      }
    }

    if (!user) {
      throw new Error('Email atau password salah');
    }

    // Get outlets dari localStorage first, fallback ke mockOutlets
    const storedOutlets: Outlet[] = JSON.parse(
      localStorage.getItem('madura_outlets') || '[]'
    );
    const allOutlets: Outlet[] =
      storedOutlets.length > 0 ? storedOutlets : mockOutlets;

    // Ambil outlets yang accessible oleh user (filter only active outlets)
    const outlets = allOutlets.filter(
      (o) =>
        user!.outlets!.includes(o.id) && (o.status || 'active') === 'active'
    );

    if (outlets.length === 0) {
      throw new Error('User tidak memiliki akses ke outlet aktif manapun');
    }

    // Set current user without password
    const userWithoutPassword: Omit<User, 'password'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      outlets: user.outlets,
    };

    setCurrentUser(userWithoutPassword);
    setUserOutlets(outlets);

    return {
      user: userWithoutPassword,
      outlets: outlets,
    };
  };

  /**
   * Select outlet untuk digunakan
   */
  const selectOutlet = (outletId: string, outletsList?: Outlet[]): void => {
    // Use provided outletsList if available
    const outletsToSearch = outletsList || userOutlets;
    const outlet = outletsToSearch.find((o) => o.id === outletId);

    if (!outlet) {
      throw new Error('Outlet tidak ditemukan atau tidak accessible');
    }

    setCurrentOutlet(outlet);
  };

  /**
   * Logout dari aplikasi
   */
  const logout = (): void => {
    setCurrentUser(null);
    setCurrentOutlet(null);
    setUserOutlets([]);
  };

  const value: OutletContextType = {
    currentUser,
    currentOutlet,
    userOutlets,
    login,
    selectOutlet,
    logout,
    mockOutlets,
    mockUsers,
  };

  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
};

/**
 * Custom hook untuk menggunakan OutletContext
 */
export const useOutlet = (): OutletContextType => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlet harus digunakan dalam OutletProvider');
  }
  return context;
};
