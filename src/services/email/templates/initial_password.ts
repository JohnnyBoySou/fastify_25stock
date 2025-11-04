import type { InitialPasswordEmailData } from '../email.service'

export const generateInitialPasswordEmailHTML = (data: InitialPasswordEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Senha Inicial - 25Stock</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .password-box { background: #fff; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .password { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; margin: 10px 0; font-family: 'Courier New', monospace; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Sua Conta Foi Criada!</h1>
          <p>25Stock - Sistema de Gestão de Estoque</p>
        </div>
        <div class="content">
          <h2>Olá, ${data.name}!</h2>
          <p>Sua conta no 25Stock foi criada com sucesso! 🎉</p>
          <p>Para acessar sua conta, utilize a senha inicial abaixo:</p>
          <div class="password-box">
            <p style="margin: 0 0 10px 0; color: #666;">Sua senha inicial:</p>
            <div class="password">${data.password}</div>
          </div>
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Guarde esta senha em local seguro</li>
              <li>Recomendamos alterar esta senha após o primeiro acesso</li>
              <li>Não compartilhe esta senha com ninguém</li>
              <li>Esta é uma senha temporária gerada automaticamente</li>
            </ul>
          </div>
          <p>Clique no botão abaixo para acessar sua conta:</p>
          <a href="${data.loginUrl}" class="button">Acessar Minha Conta</a>
          <p style="margin-top: 20px;">Ou acesse diretamente em: <a href="${data.loginUrl}">${data.loginUrl}</a></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda a esta mensagem.</p>
          <p>&copy; 2024 25Stock. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const generateInitialPasswordEmailText = (data: InitialPasswordEmailData): string => {
  return `
Sua Conta Foi Criada! - 25Stock

Olá, ${data.name}!

Sua conta no 25Stock foi criada com sucesso! 🎉

Para acessar sua conta, utilize a senha inicial abaixo:

SUA SENHA INICIAL: ${data.password}

IMPORTANTE:
- Guarde esta senha em local seguro
- Recomendamos alterar esta senha após o primeiro acesso
- Não compartilhe esta senha com ninguém
- Esta é uma senha temporária gerada automaticamente

Acesse sua conta em: ${data.loginUrl}

---
Este é um email automático, não responda a esta mensagem.
© 2024 25Stock. Todos os direitos reservados.
  `
}
