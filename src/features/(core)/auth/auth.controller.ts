import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailCodeRequest,
  VerifyEmailCodeResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
} from './auth.interfaces'
import { AuthCommands } from './commands/auth.commands'

export const AuthController = {
  async register(request: RegisterRequest, reply: FastifyReply): Promise<RegisterResponse> {
    try {
      const { name, email, password, phone } = request.body

      const user = await AuthCommands.register({
        name,
        email,
        phone,
        password,
      })

      return reply.status(201).send({
        user,
        message:
          'Usuário registrado com sucesso. Verifique seu email para o código de confirmação de 6 dígitos.',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User already exists with this email') {
        return reply.status(409).send({
          error: 'Já existe um usuário com este email',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async login(request: LoginRequest, reply: FastifyReply): Promise<LoginResponse> {
    try {
      const { email, password } = request.body

      const result = await AuthCommands.login({
        email,
        password,
      })

      return reply.send({
        user: result.user,
        store: result.store,
        token: result.token,
        message: 'Login successful',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Invalid credentials') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      if (error.message === 'Email verification required') {
        return reply.status(403).send({
          error: 'Necessário verificar o email',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async forgotPassword(
    request: ForgotPasswordRequest,
    reply: FastifyReply
  ): Promise<ForgotPasswordResponse> {
    try {
      const { email } = request.body

      await AuthCommands.forgotPassword(email)

      return reply.send({
        message: 'If the email exists, a reset password code has been sent.',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: 'If the email exists, a reset password code has been sent.',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async verifyResetCode(
    request: VerifyResetCodeRequest,
    reply: FastifyReply
  ): Promise<VerifyResetCodeResponse> {
    try {
      const { email, code } = request.body

      await AuthCommands.verifyResetCode(email, code)

      return reply.send({
        message: 'Reset code verified successfully',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Invalid or expired reset code') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      if (error.message === 'Reset code expired') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async resetPassword(
    request: ResetPasswordRequest,
    reply: FastifyReply
  ): Promise<ResetPasswordResponse> {
    try {
      const { email, code, password } = request.body

      await AuthCommands.resetPassword(email, code, password)

      return reply.send({
        message: 'Password reset successfully',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Invalid or expired reset code') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      if (error.message === 'Reset code expired') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async verifyEmail(
    request: VerifyEmailRequest,
    reply: FastifyReply
  ): Promise<VerifyEmailResponse> {
    try {
      const { token } = request.body

      await AuthCommands.verifyEmail(token)

      return reply.send({
        message: 'Email verified successfully',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Invalid verification token') {
        return reply.status(401).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async verifyEmailCode(
    request: VerifyEmailCodeRequest,
    reply: FastifyReply
  ): Promise<VerifyEmailCodeResponse> {
    try {
      const { email, code } = request.body

      const user = await AuthCommands.verifyEmailCode(email, code)

      return reply.send({
        message: 'Email verified successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      })
    } catch (error: any) {
      request.log.error(error)

      if (
        error.message === 'Invalid verification code' ||
        error.message === 'Verification code expired'
      ) {
        return reply.status(401).send({
          error: error.message,
        })
      }

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async resendVerification(
    request: ResendVerificationRequest,
    reply: FastifyReply
  ): Promise<ResendVerificationResponse> {
    try {
      const { email } = request.body

      await AuthCommands.resendVerification(email)

      return reply.send({
        message: 'Verification email sent successfully',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Email already verified') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader) {
        return reply.status(401).send({
          error: 'Authorization header required',
        })
      }

      const token = AuthCommands.extractToken(authHeader)
      const payload = AuthCommands.verifyToken(token)

      const result = await AuthCommands.refreshToken(payload.userId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Invalid authorization header' || error.message === 'User not found') {
        return reply.status(401).send({
          error: 'Invalid token',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async googleLogin(
    request: GoogleLoginRequest,
    reply: FastifyReply
  ): Promise<GoogleLoginResponse> {
    try {
      const { id_token } = request.body

      const result = await AuthCommands.googleLogin(id_token)

      return reply.send({
        user: result.user,
        store: result.store,
        token: result.token,
        message: 'Google login successful',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Google OAuth configuration missing') {
        return reply.status(500).send({
          error: 'Google OAuth não configurado no servidor',
        })
      }

      if (error.message === 'Invalid Google token') {
        return reply.status(401).send({
          error: 'Token do Google inválido',
        })
      }

      if (error.message === 'User account is disabled') {
        return reply.status(403).send({
          error: 'Conta de usuário desabilitada',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
