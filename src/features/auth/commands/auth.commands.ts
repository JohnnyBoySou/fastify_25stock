import crypto from 'node:crypto'
import { promisify } from 'node:util'
import jwt from 'jsonwebtoken'

import type { JWTPayload } from '../auth.interfaces'

import { PolarQueries } from '@/features/polar/queries/polar.queries'
import { db } from '@/plugins/prisma'
import { EmailService } from '@/services/email/email.service'
import { OAuth2Client } from 'google-auth-library'
import { PolarCommands } from '../../polar/commands/polar.commands'

const scrypt = promisify(crypto.scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  const keyBuffer = Buffer.from(key, 'hex')

  return crypto.timingSafeEqual(derivedKey, keyBuffer)
}

export const AuthCommands = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const { name, email, password, phone } = data

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    const hashedPassword = await hashPassword(password)

    // Generate verification code and token
    const verificationCode = AuthCommands.generateVerificationCode()
    const verificationToken = AuthCommands.generateVerificationToken()
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        emailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationToken: verificationToken,
        emailVerificationCodeExpires: codeExpires,
        status: true,
        isOwner: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        isOwner: true,
        storeId: true,
        createdAt: true,
      },
    })

    try {
      const freePlan = await PolarQueries.getFreePlan()

      if (freePlan) {
        const polarCustomer = await PolarCommands.createCustomer({
          email: user.email,
          name: user.name || '',
          externalId: user.id,
        })

        let polarSubscription = null
        if (polarCustomer?.id) {
          polarSubscription = await PolarCommands.createSubscription({
            customerId: polarCustomer.id,
            productId: freePlan.id,
          })
        }

        await db.subscription.create({
          data: {
            userId: user.id,
            status: 'ACTIVE',
            polarCustomerId: polarCustomer?.id || null,
            polarSubscriptionId: polarSubscription?.id || null,
            polarProductId: freePlan.id,
            polarPlanName: freePlan.name,
            priceAmount: 0,
            priceInterval: freePlan.recurringInterval === 'month' ? 'MONTHLY' : 'YEARLY',
            currency: 'BRL',
          },
        })
      } else {
        console.warn('Nenhum plano free encontrado no Polar')
      }
    } catch (e) {
      console.error('Falha ao associar plano free ao usuário:', e)
    }

    try {
      await EmailService.sendEmailVerification({
        email: user.email,
        name: user.name || '',
        verificationCode: verificationCode,
        expiresIn: '15 minutos',
      })
      console.log(`User ${email} registered - verification code sent`)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    return user
  },

  async login(data: { email: string; password: string }) {
    const { email, password } = data

    // Find user
    const user = await db.user.findUnique({
      where: { email, status: true },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Email verification required')
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Get user's store through storeId
    const store = user.storeId
      ? await db.store.findUnique({
          where: { id: user.storeId },
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            status: true,
            cep: true,
            city: true,
            state: true,
            address: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      : null

    // Generate JWT token (no roles in new schema - permissions are granular)
    const token = AuthCommands.generateJWT({
      userId: user.id,
      email: user.email,
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        lastLoginAt: new Date(),
      },
      store: store || undefined,
      token,
    }
  },

  async forgotPassword(email: string) {
    // Find user
    const user = await db.user.findUnique({
      where: { email, status: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Generate reset token
    const resetToken = AuthCommands.generateResetToken()
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    })

    // Send reset password email with token
    try {
      await EmailService.sendPasswordResetEmail({
        name: user.name || 'Usuário',
        email: user.email,
        resetCode: resetToken,
        expiresIn: '15 minutos',
      })
    } catch (error) {
      console.error('Failed to send reset password email:', error)
      // Don't fail the process if email fails
    }

    return { message: 'Reset password token sent to email' }
  },

  async verifyResetCode(email: string, code: string) {
    // Find user by email and reset token (code is the token)
    const user = await db.user.findFirst({
      where: {
        email,
        resetPasswordToken: code,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new Error('Invalid or expired reset code')
    }

    // Check if token is expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new Error('Reset code expired')
    }

    return { message: 'Reset code verified successfully' }
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    // Find user by email and reset token (code is the token)
    const user = await db.user.findFirst({
      where: {
        email,
        resetPasswordToken: code,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new Error('Invalid or expired reset code')
    }

    // Check if token is expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new Error('Reset code expired')
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password and clear reset data
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return { message: 'Password reset successfully' }
  },

  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        status: true,
      },
    })

    if (!user) {
      throw new Error('Invalid or expired verification token')
    }

    if (user.emailVerified) {
      throw new Error('Email already verified')
    }

    // Update user as verified and clear verification token
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return updatedUser
  },

  async verifyEmailCode(email: string, code: string) {
    // Find user by email and verification code
    const user = await db.user.findFirst({
      where: {
        email,
        emailVerificationCode: code,
        status: true,
      },
    })

    if (!user) {
      throw new Error('Invalid verification code')
    }

    if (user.emailVerified) {
      throw new Error('Email already verified')
    }

    // Check if code has expired
    if (user.emailVerificationCodeExpires && user.emailVerificationCodeExpires < new Date()) {
      throw new Error('Verification code has expired')
    }

    // Update user as verified and clear verification data
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return updatedUser
  },

  async resendVerification(email: string) {
    // Find user
    const user = await db.user.findUnique({
      where: { email, status: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.emailVerified) {
      throw new Error('Email already verified')
    }

    // Generate new verification code and token
    const verificationCode = AuthCommands.generateVerificationCode()
    const verificationToken = AuthCommands.generateVerificationToken()
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Update user with new verification data
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationToken: verificationToken,
        emailVerificationCodeExpires: codeExpires,
      },
    })

    // Send verification email
    try {
      await EmailService.sendEmailVerification({
        email: user.email,
        name: user.name || 'Usuário',
        verificationCode: verificationCode,
        expiresIn: '15 minutos',
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email')
    }

    return { message: 'Verification email sent successfully' }
  },

  async refreshToken(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId, status: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const token = AuthCommands.generateJWT({
      userId: user.id,
      email: user.email,
    })

    return { token, message: 'Token refreshed successfully' }
  },

  generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.sign(payload, secret, { expiresIn: '7d' })
  },

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
  },

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  },

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  },

  verifyToken(token: string): JWTPayload {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.verify(token, secret) as JWTPayload
  },

  extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header')
    }
    return authHeader.substring(7)
  },

  async googleLogin(token: string) {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth configuration missing')
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

    try {
      // Verificar o token do Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()

      if (!payload || !payload.email || !payload.name) {
        throw new Error('Invalid Google token payload')
      }

      // Buscar usuário existente
      let user = await db.user.findUnique({
        where: { email: payload.email },
      })

      // Se usuário não existe, criar novo usuário
      if (!user) {
        // Create user without store
        user = await db.user.create({
          data: {
            name: payload.name,
            email: payload.email,
            password: '', // Empty for OAuth users
            emailVerified: true, // Google já verifica o email
            status: true,
            isOwner: false,
            lastLoginAt: new Date(),
          },
        })

        // Criar Subscription e associar ao plano free na criação via Google
        try {
          const freePlan = await PolarQueries.getFreePlan()

          if (freePlan) {
            // Criar Customer no Polar
            const polarCustomer = await PolarCommands.createCustomer({
              email: user.email,
              name: user.name || '',
              externalId: user.id,
            })

            // Criar Subscription no Polar para o plano free
            let polarSubscription = null
            if (polarCustomer?.id) {
              polarSubscription = await PolarCommands.createSubscription({
                customerId: polarCustomer.id,
                productId: freePlan.id,
              })
            }

            // Criar Subscription local com IDs do Polar
            await db.subscription.create({
              data: {
                userId: user.id,
                status: 'ACTIVE',
                polarCustomerId: polarCustomer?.id || null,
                polarSubscriptionId: polarSubscription?.id || null,
                polarProductId: freePlan.id,
                polarPlanName: freePlan.name,
                priceAmount: 0,
                priceInterval: freePlan.recurringInterval === 'month' ? 'MONTHLY' : 'YEARLY',
                currency: 'BRL',
              },
            })
          } else {
            console.warn('Nenhum plano free encontrado no Polar (Google login)')
          }
        } catch (e) {
          console.error('Falha ao associar plano free (Google):', e)
        }
      } else {
        // Se usuário existe, atualizar último login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
      }

      // Verificar se usuário está ativo
      if (!user.status) {
        throw new Error('User account is disabled')
      }

      // Buscar store do usuário através de storeId
      const store = user.storeId
        ? await db.store.findUnique({
            where: { id: user.storeId },
            select: {
              id: true,
              name: true,
              cnpj: true,
              email: true,
              phone: true,
              status: true,
              cep: true,
              city: true,
              state: true,
              address: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : null

      // Gerar JWT token (no roles in new schema)
      const jwtToken = AuthCommands.generateJWT({
        userId: user.id,
        email: user.email,
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        store: store || undefined,
        token: jwtToken,
      }
    } catch (error: any) {
      // Log do erro para debugging
      console.error('Google Login Error:', error)

      if (error.message === 'Google OAuth configuration missing') {
        throw new Error('Google OAuth configuration missing')
      }

      if (error.message === 'Invalid Google token payload') {
        throw new Error('Invalid Google token')
      }

      if (error.message === 'User account is disabled') {
        throw new Error('User account is disabled')
      }

      // Para outros erros, assumir token inválido
      throw new Error('Invalid Google token')
    }
  },
}
