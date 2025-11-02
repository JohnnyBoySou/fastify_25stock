import fs from 'node:fs'
import path from 'node:path'

export interface InvoicePdfData {
  invoice: {
    id: string
    amount: number
    status: string
    createdAt: Date
    paymentDate?: Date
  }
  customer: {
    name: string
    email: string
    phone?: string
  }
  plan?: {
    name: string
    description?: string
    price: number
    interval: string
  }
  company?: {
    name: string
    address: string
    phone: string
    email: string
    cnpj?: string
  }
}

export interface PdfResult {
  success: boolean
  buffer?: Buffer
  path?: string
  error?: string
}

export class InvoicePdfService {
  private templatesPath: string

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'src', 'templates', 'pdf')
  }

  async generateInvoicePdf(data: InvoicePdfData): Promise<PdfResult> {
    try {
      // Em uma implementação real, aqui seria usado PDFKit, Puppeteer ou similar
      // Por enquanto, vamos simular a geração do PDF
      console.log('Generating PDF for invoice:', data.invoice.id)

      // Simular geração de PDF
      const pdfContent = this.generatePdfContent(data)

      // Em uma implementação real, aqui seria gerado o buffer do PDF
      // Por enquanto, criamos um arquivo de texto simulando o PDF
      const outputPath = path.join(
        process.cwd(),
        'src',
        'uploads',
        'invoices',
        `${data.invoice.id}.pdf`
      )

      // Garantir que o diretório existe
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Escrever conteúdo simulado
      fs.writeFileSync(outputPath, pdfContent)

      return {
        success: true,
        path: outputPath,
        buffer: Buffer.from(pdfContent),
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async generateInvoiceTemplate(data: InvoicePdfData): Promise<string> {
    try {
      // Gerar template HTML para a fatura
      const html = this.generateHtmlTemplate(data)

      // Em uma implementação real com Puppeteer, aqui seria:
      // const browser = await puppeteer.launch();
      // const page = await browser.newPage();
      // await page.setContent(html);
      // const pdf = await page.pdf({ format: 'A4' });
      // await browser.close();

      return html
    } catch (error) {
      console.error('Error generating template:', error)
      throw error
    }
  }

  private generatePdfContent(data: InvoicePdfData): string {
    const company = data.company || {
      name: '20Stock',
      address: 'Rua Exemplo, 123 - São Paulo, SP',
      phone: '(11) 99999-9999',
      email: 'contato@20stock.com',
      cnpj: '00.000.000/0001-00',
    }

    return `
FATURA #${data.invoice.id}

DADOS DA EMPRESA:
${company.name}
${company.address}
Telefone: ${company.phone}
Email: ${company.email}
${company.cnpj ? `CNPJ: ${company.cnpj}` : ''}

DADOS DO CLIENTE:
Nome: ${data.customer.name}
Email: ${data.customer.email}
${data.customer.phone ? `Telefone: ${data.customer.phone}` : ''}

DETALHES DA FATURA:
${
  data.plan
    ? `
Plano: ${data.plan.name}
${data.plan.description ? `Descrição: ${data.plan.description}` : ''}
Valor do Plano: R$ ${data.plan.price.toFixed(2)} (${data.plan.interval})
`
    : ''
}

VALOR TOTAL: R$ ${data.invoice.amount.toFixed(2)}
Status: ${data.invoice.status}
Data de Criação: ${data.invoice.createdAt.toLocaleDateString('pt-BR')}
${data.invoice.paymentDate ? `Data de Pagamento: ${data.invoice.paymentDate.toLocaleDateString('pt-BR')}` : ''}

Obrigado por escolher nossos serviços!
    `.trim()
  }

  private generateHtmlTemplate(data: InvoicePdfData): string {
    const company = data.company || {
      name: '20Stock',
      address: 'Rua Exemplo, 123 - São Paulo, SP',
      phone: '(11) 99999-9999',
      email: 'contato@20stock.com',
      cnpj: '00.000.000/0001-00',
    }

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatura #${data.invoice.id}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            text-align: right;
            margin-bottom: 20px;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .invoice-number {
            font-size: 16px;
            color: #666;
        }
        .content {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .customer-info, .invoice-details {
            flex: 1;
            margin: 0 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-item {
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }
        .status.paid {
            background: #d4edda;
            color: #155724;
        }
        .status.pending {
            background: #fff3cd;
            color: #856404;
        }
        .status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div class="invoice-title">FATURA</div>
            <div class="invoice-number">#${data.invoice.id}</div>
        </div>
    </div>

    <div class="content">
        <div class="customer-info">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-item">
                <span class="label">Nome:</span> ${data.customer.name}
            </div>
            <div class="info-item">
                <span class="label">Email:</span> ${data.customer.email}
            </div>
            ${
              data.customer.phone
                ? `
            <div class="info-item">
                <span class="label">Telefone:</span> ${data.customer.phone}
            </div>
            `
                : ''
            }
        </div>

        <div class="invoice-details">
            <div class="section-title">Detalhes da Fatura</div>
            ${
              data.plan
                ? `
            <div class="info-item">
                <span class="label">Plano:</span> ${data.plan.name}
            </div>
            ${
              data.plan.description
                ? `
            <div class="info-item">
                <span class="label">Descrição:</span> ${data.plan.description}
            </div>
            `
                : ''
            }
            <div class="info-item">
                <span class="label">Valor do Plano:</span> R$ ${data.plan.price.toFixed(2)} (${data.plan.interval})
            </div>
            `
                : ''
            }
            <div class="info-item">
                <span class="label">Data de Criação:</span> ${data.invoice.createdAt.toLocaleDateString('pt-BR')}
            </div>
            ${
              data.invoice.paymentDate
                ? `
            <div class="info-item">
                <span class="label">Data de Pagamento:</span> ${data.invoice.paymentDate.toLocaleDateString('pt-BR')}
            </div>
            `
                : ''
            }
            <div class="info-item">
                <span class="label">Status:</span> 
                <span class="status ${data.invoice.status.toLowerCase()}">${data.invoice.status}</span>
            </div>
        </div>
    </div>

    <div class="amount">
        VALOR TOTAL: R$ ${data.invoice.amount.toFixed(2)}
    </div>

    <div class="footer">
        <p><strong>${company.name}</strong></p>
        <p>${company.address}</p>
        <p>Telefone: ${company.phone} | Email: ${company.email}</p>
        ${company.cnpj ? `<p>CNPJ: ${company.cnpj}</p>` : ''}
        <p style="margin-top: 20px;">Obrigado por escolher nossos serviços!</p>
    </div>
</body>
</html>
    `
  }

  async getInvoiceTemplate(): Promise<string | null> {
    try {
      const templatePath = path.join(this.templatesPath, 'invoice.html')

      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8')
      }

      return null
    } catch (error) {
      console.error('Error getting template:', error)
      return null
    }
  }

  async deleteInvoicePdf(invoiceId: string): Promise<boolean> {
    try {
      const pdfPath = path.join(process.cwd(), 'src', 'uploads', 'invoices', `${invoiceId}.pdf`)

      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath)
        return true
      }

      return false
    } catch (error) {
      console.error('Error deleting PDF:', error)
      return false
    }
  }

  async getInvoicePdfPath(invoiceId: string): Promise<string | null> {
    try {
      const pdfPath = path.join(process.cwd(), 'src', 'uploads', 'invoices', `${invoiceId}.pdf`)

      if (fs.existsSync(pdfPath)) {
        return pdfPath
      }

      return null
    } catch (error) {
      console.error('Error getting PDF path:', error)
      return null
    }
  }
}
