import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  companyName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  cid?: string; // 车队ID
}

interface AuthState {
  isLoggedIn: boolean;
  currentUser: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      currentUser: null,
      token: null,
      refreshToken: null,
      
      login: (user: User, token: string, refreshToken?: string) => {
        set({
          isLoggedIn: true,
          currentUser: user,
          token,
          refreshToken: refreshToken || null,
        });
      },
      
      logout: () => {
        set({
          isLoggedIn: false,
          currentUser: null,
          token: null,
          refreshToken: null,
        });
      },
      
      updateUser: (userUpdate: Partial<User>) => {
        const currentUser = get().currentUser;
        if (currentUser) {
          set({
            currentUser: { ...currentUser, ...userUpdate }
          });
        }
      },
      
      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
