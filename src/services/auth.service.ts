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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  },
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await api.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
  },
};
