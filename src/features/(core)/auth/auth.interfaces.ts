import type { FastifyRequest } from 'fastify'

// Register interfaces
export interface RegisterRequest extends FastifyRequest {
  body: {
    name: string
    email: string
    password: string
    phone: string
  }
}

export interface RegisterResponse {
  user: {
    id: string
    name: string
    email: string
    phone: string
    emailVerified: boolean
    createdAt: Date
  }
  message: string
}

// Login interfaces
export interface LoginRequest extends FastifyRequest {
  body: {
    email: string
    password: string
  }
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    lastLoginAt: Date
  }
  store?: {
    id: string
    name: string
    cnpj: string
    email?: string
    phone?: string
    status: boolean
    cep?: string
    city?: string
    state?: string
    address?: string
    createdAt: Date
    updatedAt: Date
  }
  token: string
  message: string
}

// Reset Password interfaces
export interface ForgotPasswordRequest extends FastifyRequest {
  body: {
    email: string
  }
}

export interface VerifyResetCodeRequest extends FastifyRequest {
  body: {
    email: string
    code: string
  }
}

export interface ResetPasswordRequest extends FastifyRequest {
  body: {
    email: string
    code: string
    password: string
  }
}

export interface ForgotPasswordResponse {
  message: string
}

export interface VerifyResetCodeResponse {
  message: string
}

export interface ResetPasswordResponse {
  message: string
}

// Email Verification interfaces
export interface VerifyEmailRequest extends FastifyRequest {
  body: {
    token: string
  }
}

export interface VerifyEmailCodeRequest extends FastifyRequest {
  body: {
    email: string
    code: string
  }
}

export interface ResendVerificationRequest extends FastifyRequest {
  body: {
    email: string
  }
}

export interface VerifyEmailResponse {
  message: string
}

export interface VerifyEmailCodeResponse {
  message: string
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
  }
}

export interface ResendVerificationResponse {
  message: string
}

// Auth User interface
export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  status: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// JWT Payload interface
export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Auth Context interface
export interface AuthContext {
  user: AuthUser
  token: string
}

// Email Service interface
export interface EmailService {
  sendVerificationEmail(email: string, token: string, name: string): Promise<void>
  sendResetPasswordEmail(email: string, token: string, name: string): Promise<void>
}

// Password Service interface
export interface PasswordService {
  hash(password: string): Promise<string>
  compare(password: string, hash: string): Promise<boolean>
  generateResetToken(): string
  generateVerificationToken(): string
}

// JWT Service interface
export interface JWTService {
  generate(payload: Omit<JWTPayload, 'iat' | 'exp'>): string
  verify(token: string): JWTPayload
}

// Update Profile interfaces
export interface UpdateProfileRequest extends FastifyRequest {
  body: {
    name?: string
    email?: string
  }
  headers: {
    authorization: string
  }
}

export interface UpdateProfileResponse {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    status: boolean
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
  }
  message: string
}

// Google Login interfaces
export interface GoogleLoginRequest extends FastifyRequest {
  body: {
    id_token: string
  }
}

export interface GoogleLoginResponse {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    lastLoginAt: Date | null
  }
  store?: {
    id: string
    name: string
    cnpj: string
    email?: string
    phone?: string
    status: boolean
    cep?: string
    city?: string
    state?: string
    address?: string
    createdAt: Date
    updatedAt: Date
  }
  token: string
  message: string
}

// Get Profile Permissions interfaces
export interface GetProfilePermissionsRequest extends FastifyRequest {
  headers: {
    authorization: string
  }
  Querystring: {
    storeId?: string
    active?: boolean
    page?: number
    limit?: number
  }
}

export interface ProfilePermissionsResponse {
  userId: string
  storeId?: string
  effectivePermissions: string[]
  customPermissions: Array<{
    id: string
    action: string
    resource?: string
    storeId?: string
    grant: boolean
    conditions?: any
    expiresAt?: Date
    reason?: string
    createdAt: Date
    createdBy: string
    creator?: {
      id: string
      name: string
      email: string
    }
  }>
  storePermissions: Array<{
    id: string
    storeId: string
    storeRole: string
    permissions: string[]
    conditions?: any
    expiresAt?: Date
    createdAt: Date
    createdBy: string
    store?: {
      id: string
      name: string
    }
    creator?: {
      id: string
      name: string
      email: string
    }
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
