export interface User {
  id: string;
  email: string;
  name?: string;
  pin?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pinVerified: boolean;
}