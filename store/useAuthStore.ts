import { AuthState, User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
}

const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date(),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pinVerified: false,

      login: async (email: string, password: string) => {
        // Mock authentication
        if (email === 'demo@example.com' && password === 'password') {
          set({ user: MOCK_USER, isAuthenticated: true });
          return true;
        }
        return false;
      },

      register: async (email: string, password: string, name?: string) => {
        // Mock registration
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          createdAt: new Date(),
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, pinVerified: false });
      },

      setPin: (pin: string) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, pin } });
        }
      },

      verifyPin: (pin: string) => {
        const { user } = get();
        if (user?.pin === pin) {
          set({ pinVerified: true });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);