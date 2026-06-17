export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profilePhotoUrl?: string;
  createdAt?: Date;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
