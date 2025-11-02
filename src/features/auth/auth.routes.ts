import type { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller'
import { AuthSchemas } from './auth.schema'

export async function AuthRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/signup', {
    schema: AuthSchemas.register,
    handler: AuthController.register,
  })

  // Login
  fastify.post('/signin', {
    schema: AuthSchemas.login,
    handler: AuthController.login,
  })

  // Forgot Password
  fastify.post('/forgot-password', {
    schema: AuthSchemas.forgotPassword,
    handler: AuthController.forgotPassword,
  })

  // Verify Reset Code
  fastify.post('/verify-reset-code', {
    schema: AuthSchemas.verifyResetCode,
    handler: AuthController.verifyResetCode,
  })

  // Reset Password
  fastify.post('/reset-password', {
    schema: AuthSchemas.resetPassword,
    handler: AuthController.resetPassword,
  })

  // Verify Email
  fastify.post('/verify-email', {
    schema: AuthSchemas.verifyEmail,
    handler: AuthController.verifyEmail,
  })

  // Verify Email Code
  fastify.post('/verify-email-code', {
    schema: AuthSchemas.verifyEmailCode,
    handler: AuthController.verifyEmailCode,
  })

  // Google Login
  fastify.post('/google', {
    schema: AuthSchemas.googleLogin,
    handler: AuthController.googleLogin,
  })

  // Resend Verification
  fastify.post('/resend-verification', {
    schema: AuthSchemas.resendVerification,
    handler: AuthController.resendVerification,
  })

  // Refresh Token
  fastify.post('/refresh-token', {
    schema: AuthSchemas.refreshToken,
    handler: AuthController.refreshToken,
  })
}
