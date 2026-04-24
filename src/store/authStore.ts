import { create } from 'zustand';
import { User } from '../types/database';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initially not logged in
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
