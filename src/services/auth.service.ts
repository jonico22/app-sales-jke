import api from './api.client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Role {
  code: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  role: Role;
}

export interface Session {
  id: string;
  token: string;
  expiresAt: string;
  userId: string;
}

export interface LoginData {
  token: string;
  user: User;
  newExpiresAt: string;
  role: Role;
  session: Session;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: () => {
    // Backend logout handling can go here if needed
  },
};
