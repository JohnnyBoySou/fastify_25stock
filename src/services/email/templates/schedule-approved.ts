import { getLogoBase64 } from './logo-helper'

export interface ScheduleApprovedEmailData {
  name: string
  email: string
  scheduleTitle: string
  spaceName: string
  startTime: string
  endTime: string
  scheduleUrl: string
}

export const generateScheduleApprovedEmailHTML = (data: ScheduleApprovedEmailData): string => {
  const logoUrl = getLogoBase64()
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agendamento Aprovado - 25Stock</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #019866; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; color: #043721; }
        .button { display: inline-block; background: #043721; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; text-align: center; }
        .success-box { background: #d4edda; border: 2px solid #019866; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .info-box { background: #fff; border: 2px solid #019866; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .info-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 600; color: #043721; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button-container { text-align: center; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div style="text-align: center;">
        <img src="${logoUrl}" alt="logo" style="max-width: 200px; height: auto;" />
      </div>
      <div class="container">
        <div class="content">
          <h2>Olá, ${data.name}!</h2>
          
          <div class="success-box">
            <h3 style="margin: 0 0 10px 0; color: #043721;">✅ Agendamento Aprovado!</h3>
            <p style="margin: 0; color: #043721;">Seu agendamento foi aprovado com sucesso.</p>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Título:</span> ${data.scheduleTitle}
            </div>
            <div class="info-row">
              <span class="info-label">Espaço:</span> ${data.spaceName}
            </div>
            <div class="info-row">
              <span class="info-label">Data/Hora de Início:</span> ${data.startTime}
            </div>
            <div class="info-row">
              <span class="info-label">Data/Hora de Término:</span> ${data.endTime}
            </div>
          </div>

          <div class="button-container">
            <a href="${data.scheduleUrl}" class="button">Ver Detalhes do Agendamento</a>
          </div>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda a esta mensagem.</p>
          <p>&copy; 2026 25Stock. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const generateScheduleApprovedEmailText = (data: ScheduleApprovedEmailData): string => {
  return `
Agendamento Aprovado - 25Stock

Olá, ${data.name}!

✅ Seu agendamento foi aprovado com sucesso!

Detalhes do Agendamento:
- Título: ${data.scheduleTitle}
- Espaço: ${data.spaceName}
- Data/Hora de Início: ${data.startTime}
- Data/Hora de Término: ${data.endTime}

Acesse os detalhes em: ${data.scheduleUrl}

---
Este é um email automático, não responda a esta mensagem.
© 2026 25Stock. Todos os direitos reservados.
  `
}

