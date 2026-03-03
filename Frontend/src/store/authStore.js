// =============================================
// authStore.js — Authentication state
// =============================================

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:  null,   // { id, username, email }
  token: null,   // JWT token

  // Save user and token after login/register
  setAuth: (user, token) => set({ user, token }),

  // Clear auth state on logout
  logout: () => set({ user: null, token: null }),

  // Check if user is logged in
  isLoggedIn: () => !!useAuthStore.getState().token,
}));

export default useAuthStore;