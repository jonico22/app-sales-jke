import api from './api.client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  societyId?: string;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  documentNumber: string | null;
  documentType?: DocumentType;
}

export interface UserSession {
  id: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  role: Role;
  person?: Person;
  sessions?: UserSession[];
  createdAt?: string;
  updatedAt?: string;
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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  image?: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    role: Role;
    token: string;
    expiresAt: string;
  };
}

export interface RefreshSessionResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    expiresAt: string;
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  getMe: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },
  refreshSession: async (): Promise<RefreshSessionResponse> => {
    const response = await api.post<RefreshSessionResponse>('/auth/refresh-session');
    return response.data;
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
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await api.put<UpdateProfileResponse>('/users/me', data);
    return response.data;
  },
};
