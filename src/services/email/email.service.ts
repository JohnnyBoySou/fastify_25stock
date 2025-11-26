import { Resend } from 'resend'
import {
  generateEmailVerificationHTML,
  generateEmailVerificationText,
  generateInitialPasswordEmailHTML,
  generateInitialPasswordEmailText,
  generateNotificationEmailHTML,
  generateNotificationEmailText,
  generatePasswordResetEmailHTML,
  generatePasswordResetEmailText,
  generateStockLowEmailHTML,
  generateStockLowEmailText,
  generateStoreInviteEmailHTML,
  generateStoreInviteEmailText,
  generateWelcomeEmailHTML,
  generateWelcomeEmailText,
  generateScheduleApprovalRequestEmailHTML,
  generateScheduleApprovalRequestEmailText,
  generateScheduleApprovedEmailHTML,
  generateScheduleApprovedEmailText,
  generateScheduleRejectedEmailHTML,
  generateScheduleRejectedEmailText,
  type ScheduleApprovalRequestEmailData,
  type ScheduleApprovedEmailData,
  type ScheduleRejectedEmailData,
} from './templates'

// Configuração do Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Interfaces para os tipos de email
export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface WelcomeEmailData {
  name: string
  email: string
  loginUrl: string
}

export interface PasswordResetEmailData {
  name: string
  email: string
  resetCode: string
  expiresIn: string
}

export interface NotificationEmailData {
  name: string
  email: string
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

export interface StoreInviteEmailData {
  name: string
  email: string
  storeName: string
  inviterName: string
  acceptUrl: string
  expiresIn: string
}

export interface EmailVerificationData {
  name: string
  email: string
  verificationCode: string
  expiresIn: string
}

export interface InitialPasswordEmailData {
  name: string
  email: string
  password: string
  loginUrl: string
}

export type {
  ScheduleApprovalRequestEmailData,
  ScheduleApprovedEmailData,
  ScheduleRejectedEmailData,
}

export const EmailService = {
  /**
   * Envia email de boas-vindas para novos usuários
   */
  sendWelcomeEmail: async (data: WelcomeEmailData): Promise<boolean> => {
    try {
      const html = generateWelcomeEmailHTML(data)
      const text = generateWelcomeEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Bem-vindo ao 25Stock, ${data.name}!`,
        html,
        text,
      })

      console.log('Welcome email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return false
    }
  },

  /**
   * Envia email de redefinição de senha
   */
  sendPasswordResetEmail: async (data: PasswordResetEmailData): Promise<boolean> => {
    try {
      const html = generatePasswordResetEmailHTML(data)
      const text = generatePasswordResetEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: 'Redefinição de senha - 25Stock',
        html,
        text,
      })

      console.log('Password reset email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return false
    }
  },

  /**
   * Envia email de notificação
   */
  sendNotificationEmail: async (data: NotificationEmailData): Promise<boolean> => {
    try {
      const html = generateNotificationEmailHTML(data)
      const text = generateNotificationEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Notificação - ${data.title}`,
        html,
        text,
      })

      console.log('Notification email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending notification email:', error)
      return false
    }
  },

  /**
   * Envia convite para loja
   */
  sendStoreInviteEmail: async (data: StoreInviteEmailData): Promise<boolean> => {
    try {
      const html = generateStoreInviteEmailHTML(data)
      const text = generateStoreInviteEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Convite para loja ${data.storeName} - 25Stock`,
        html,
        text,
      })

      console.log('Store invite email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending store invite email:', error)
      return false
    }
  },

  /**
   * Envia email de notificação de estoque baixo
   */
  sendStockLowEmail: async (data: NotificationEmailData): Promise<boolean> => {
    try {
      const html = generateStockLowEmailHTML(data)
      const text = generateStockLowEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `⚠️ ${data.title} - 25Stock`,
        html,
        text,
      })

      console.log('Stock low email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending stock low email:', error)
      return false
    }
  },

  /**
   * Envia email de verificação com código de 6 dígitos
   */
  sendEmailVerification: async (data: EmailVerificationData): Promise<boolean> => {
    try {
      const html = generateEmailVerificationHTML(data)
      const text = generateEmailVerificationText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: 'Confirmação de Email - 25Stock',
        html,
        text,
      })

      console.log('Email verification sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending email verification:', error)
      return false
    }
  },

  /**
   * Envia email com senha inicial para novos usuários
   */
  sendInitialPasswordEmail: async (data: InitialPasswordEmailData): Promise<boolean> => {
    try {
      const html = generateInitialPasswordEmailHTML(data)
      const text = generateInitialPasswordEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: 'Sua conta foi criada - 25Stock',
        html,
        text,
      })

      console.log('Initial password email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending initial password email:', error)
      return false
    }
  },

  /**
   * Envia email genérico
   */
  sendEmail: async (template: EmailTemplate): Promise<boolean> => {
    try {
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      console.log('Email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  },

  /**
   * Envia email de solicitação de aprovação de agendamento
   */
  sendScheduleApprovalRequestEmail: async (
    data: ScheduleApprovalRequestEmailData
  ): Promise<boolean> => {
    try {
      const html = generateScheduleApprovalRequestEmailHTML(data)
      const text = generateScheduleApprovalRequestEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Solicitação de Aprovação de Agendamento - ${data.scheduleTitle}`,
        html,
        text,
      })

      console.log('Schedule approval request email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending schedule approval request email:', error)
      return false
    }
  },

  /**
   * Envia email de agendamento aprovado
   */
  sendScheduleApprovedEmail: async (data: ScheduleApprovedEmailData): Promise<boolean> => {
    try {
      const html = generateScheduleApprovedEmailHTML(data)
      const text = generateScheduleApprovedEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Agendamento Aprovado - ${data.scheduleTitle}`,
        html,
        text,
      })

      console.log('Schedule approved email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending schedule approved email:', error)
      return false
    }
  },

  /**
   * Envia email de agendamento rejeitado
   */
  sendScheduleRejectedEmail: async (data: ScheduleRejectedEmailData): Promise<boolean> => {
    try {
      const html = generateScheduleRejectedEmailHTML(data)
      const text = generateScheduleRejectedEmailText(data)

      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@25stock.com',
        to: data.email,
        subject: `Agendamento Rejeitado - ${data.scheduleTitle}`,
        html,
        text,
      })

      console.log('Schedule rejected email sent:', result.data?.id)
      return true
    } catch (error) {
      console.error('Error sending schedule rejected email:', error)
      return false
    }
  },
}
