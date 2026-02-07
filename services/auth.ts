// Auth service that can be swapped between mock and Supabase
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from './supabase';

export class AuthService {
  private static instance: AuthService;
  private useSupabase = false; // Switch to true when Supabase is configured

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<boolean> {
    if (this.useSupabase) {
      // Supabase implementation
      const { data, error } = await supabase.auth.signIn(email, password);
      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }
      return true;
    } else {
      // Mock implementation
      return useAuthStore.getState().login(email, password);
    }
  }

  async register(email: string, password: string, name?: string): Promise<boolean> {
    if (this.useSupabase) {
      // Supabase implementation
      const { data, error } = await supabase.auth.signUp(email, password);
      if (error) {
        console.error('Supabase register error:', error);
        return false;
      }
      return true;
    } else {
      // Mock implementation
      return useAuthStore.getState().register(email, password, name);
    }
  }

  async logout(): Promise<void> {
    if (this.useSupabase) {
      await supabase.auth.signOut();
    }
    useAuthStore.getState().logout();
  }

  setUseSupabase(useSupabase: boolean): void {
    this.useSupabase = useSupabase;
  }
}

export const authService = AuthService.getInstance();