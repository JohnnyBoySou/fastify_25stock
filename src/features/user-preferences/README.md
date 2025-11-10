# 📋 User Preferences - Configurações do Usuário

## 🎯 **Visão Geral**
Este módulo gerencia as configurações e preferências do usuário, incluindo tema, linguagem, moeda, notificações e outras personalizações.

## 📁 **Estrutura Implementada**
```
src/features/user-preferences/
├── commands/
│   └── user-preferences.commands.ts    # Operações de escrita (CREATE, UPDATE, DELETE)
├── queries/
│   └── user-preferences.query.ts       # Operações de leitura (GET, LIST, SEARCH)
├── user-preferences.controller.ts      # Controller principal
├── user-preferences.interfaces.ts      # Interfaces TypeScript
├── user-preferences.routes.ts          # Definição das rotas
└── user-preferences.schema.ts          # Schemas de validação
```

## 🗄️ **Modelos do Banco de Dados**

### **Opção 1: Campos diretos no modelo User (Implementado)**
```prisma
model User {
  // ... outros campos
  
  // User Preferences/Configurations
  theme                  String      @default("light") // light, dark, auto
  language              String      @default("pt-BR") // pt-BR, en-US, es-ES
  currency              String      @default("BRL") // BRL, USD, EUR
  timezone              String      @default("America/Sao_Paulo")
  dateFormat            String      @default("DD/MM/YYYY") // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  timeFormat            String      @default("24h") // 12h, 24h
  dashboard             Json?       // Configurações do dashboard (widgets, layout, etc.)
}
```

### **Opção 2: Modelo separado UserPreferences (Implementado)**
```prisma
model UserPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Theme & UI Preferences
  theme                 String   @default("light") // light, dark, auto
  primaryColor          String?  // Cor primária personalizada
  sidebarCollapsed      Boolean  @default(false)
  compactMode           Boolean  @default(false)
  
  // Language & Localization
  language              String   @default("pt-BR")
  currency              String   @default("BRL")
  timezone              String   @default("America/Sao_Paulo")
  dateFormat            String   @default("DD/MM/YYYY")
  timeFormat            String   @default("24h")
  numberFormat          String   @default("pt-BR") // pt-BR, en-US
  
  // Notification Preferences
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  smsNotifications      Boolean  @default(false)
  notificationTypes     Json?    // Tipos específicos de notificação
  
  // Dashboard & Layout
  dashboardLayout       Json?    // Layout personalizado do dashboard
  defaultPage           String?  // Página inicial padrão
  itemsPerPage          Int      @default(20)
  
  // Business Preferences
  defaultStoreId        String?  // Loja padrão para o usuário
  autoRefresh           Boolean  @default(true)
  refreshInterval       Int      @default(30) // segundos
  
  // Advanced Settings
  customSettings        Json?    // Configurações personalizadas extensíveis
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("user_preferences")
}
```

## 🛣️ **Endpoints Disponíveis**

### **CRUD Básico**
- `POST /user-preferences` - Criar configurações do usuário
- `GET /user-preferences` - Listar configurações (com paginação e filtros)
- `GET /user-preferences/:id` - Buscar configurações por ID
- `PUT /user-preferences/:id` - Atualizar configurações por ID
- `DELETE /user-preferences/:id` - Deletar configurações por ID

### **Operações por Usuário**
- `GET /user-preferences/user/:userId` - Buscar configurações por usuário
- `GET /user-preferences/user/:userId/or-create` - Buscar ou criar configurações padrão
- `PUT /user-preferences/user/:userId` - Atualizar configurações por usuário
- `DELETE /user-preferences/user/:userId` - Deletar configurações por usuário

### **Filtros e Busca**
- `GET /user-preferences/theme/:theme` - Filtrar por tema
- `GET /user-preferences/language/:language` - Filtrar por idioma
- `GET /user-preferences/currency/:currency` - Filtrar por moeda
- `GET /user-preferences/custom-settings` - Buscar configurações personalizadas
- `GET /user-preferences/search?q=termo` - Buscar configurações

### **Estatísticas e Utilitários**
- `GET /user-preferences/stats` - Estatísticas das configurações
- `POST /user-preferences/validate` - Validar dados de configuração
- `PATCH /user-preferences/:id/reset` - Resetar para padrões
- `PATCH /user-preferences/user/:userId/reset` - Resetar por usuário

## 📝 **Exemplos de Uso**

### **Criar Configurações do Usuário**
```typescript
POST /user-preferences
{
  "userId": "user123",
  "theme": "dark",
  "language": "pt-BR",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "emailNotifications": true,
  "pushNotifications": true,
  "itemsPerPage": 25,
  "autoRefresh": true,
  "refreshInterval": 30
}
```

### **Atualizar Configurações**
```typescript
PUT /user-preferences/user/user123
{
  "theme": "light",
  "language": "en-US",
  "currency": "USD",
  "itemsPerPage": 50
}
```

### **Buscar Configurações do Usuário**
```typescript
GET /user-preferences/user/user123/or-create
```

### **Filtrar por Tema**
```typescript
GET /user-preferences/theme/dark
```

### **Buscar Configurações**
```typescript
GET /user-preferences/search?q=dark&limit=10
```

### **Obter Estatísticas**
```typescript
GET /user-preferences/stats
```

## 🎨 **Configurações Disponíveis**

### **Tema e Interface**
- `theme`: `light`, `dark`, `auto`
- `primaryColor`: Cor primária em hex (#RRGGBB)
- `sidebarCollapsed`: Sidebar recolhida
- `compactMode`: Modo compacto

### **Idioma e Localização**
- `language`: `pt-BR`, `en-US`, `es-ES`
- `currency`: `BRL`, `USD`, `EUR`
- `timezone`: Fuso horário (ex: `America/Sao_Paulo`)
- `dateFormat`: `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`
- `timeFormat`: `12h`, `24h`
- `numberFormat`: `pt-BR`, `en-US`

### **Notificações**
- `emailNotifications`: Notificações por email
- `pushNotifications`: Notificações push
- `smsNotifications`: Notificações por SMS
- `notificationTypes`: Configurações específicas (JSON)

### **Dashboard e Layout**
- `dashboardLayout`: Layout personalizado (JSON)
- `defaultPage`: Página inicial padrão
- `itemsPerPage`: Itens por página (5-100)

### **Preferências de Negócio**
- `defaultStoreId`: Loja padrão
- `autoRefresh`: Atualização automática
- `refreshInterval`: Intervalo de atualização (10-300 segundos)

### **Configurações Avançadas**
- `customSettings`: Configurações personalizadas (JSON)

## 🔧 **Validações Implementadas**

### **Validações de Entrada**
- Tema deve ser: `light`, `dark`, `auto`
- Formato de data deve ser: `DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`
- Formato de tempo deve ser: `12h`, `24h`
- Items por página: 5-100
- Intervalo de atualização: 10-300 segundos
- Cor primária: formato hex válido

### **Validações de Negócio**
- Usuário deve existir
- Não pode criar configurações duplicadas para o mesmo usuário
- Configurações devem existir para atualização/exclusão

## 📊 **Estatísticas Disponíveis**

```typescript
{
  "totalPreferences": 150,
  "themeDistribution": {
    "light": 80,
    "dark": 60,
    "auto": 10
  },
  "languageDistribution": {
    "pt-BR": 120,
    "en-US": 25,
    "es-ES": 5
  },
  "currencyDistribution": {
    "BRL": 120,
    "USD": 25,
    "EUR": 5
  },
  "averageItemsPerPage": 22,
  "notificationsEnabled": 140,
  "notificationsDisabled": 10
}
```

## 🚀 **Como Usar no Frontend**

### **1. Buscar Configurações do Usuário**
```typescript
const preferences = await api.get('/user-preferences/user/current-user-id/or-create')
```

### **2. Atualizar Tema**
```typescript
await api.put('/user-preferences/user/current-user-id', {
  theme: 'dark'
})
```

### **3. Configurar Notificações**
```typescript
await api.put('/user-preferences/user/current-user-id', {
  emailNotifications: true,
  pushNotifications: false,
  notificationTypes: {
    stockAlerts: true,
    movements: false,
    systemUpdates: true
  }
})
```

### **4. Personalizar Dashboard**
```typescript
await api.put('/user-preferences/user/current-user-id', {
  dashboardLayout: {
    widgets: ['stock-summary', 'recent-movements', 'alerts'],
    layout: 'grid',
    columns: 3
  },
  defaultPage: '/dashboard',
  itemsPerPage: 25
})
```

## ⚠️ **Considerações Importantes**

1. **Fallback**: Se não existir configurações, o sistema usa valores padrão
2. **Validação**: Sempre valide dados antes de salvar
3. **Performance**: Use cache para configurações frequentemente acessadas
4. **Segurança**: Valide permissões antes de modificar configurações
5. **Backup**: Considere backup das configurações personalizadas

## 🔄 **Migração de Dados**

Para migrar configurações existentes:

```sql
-- Exemplo de migração de configurações básicas
INSERT INTO user_preferences (userId, theme, language, currency, timezone)
SELECT 
  id as userId,
  'light' as theme,
  'pt-BR' as language,
  'BRL' as currency,
  'America/Sao_Paulo' as timezone
FROM users 
WHERE id NOT IN (SELECT userId FROM user_preferences);
```

## 📈 **Próximos Passos**

1. **Implementar cache** para configurações frequentemente acessadas
2. **Adicionar middleware** para aplicar configurações automaticamente
3. **Criar templates** de configurações por tipo de usuário
4. **Implementar sincronização** entre dispositivos
5. **Adicionar histórico** de mudanças nas configurações
