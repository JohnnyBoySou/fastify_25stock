# Web Push Notifications

Sistema de notificações push implementado usando Web Push API.

## Configuração

### Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# VAPID Keys (geradas usando web-push ou em https://web-push-codelab.glitch.me/)
VAPID_PUBLIC_KEY=sua_public_key_aqui
VAPID_PRIVATE_KEY=sua_private_key_aqui

# Opcional: Email para o VAPID subject
VAPID_SUBJECT=mailto:admin@example.com
```

### Gerar VAPID Keys

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar VAPID keys
web-push generate-vapid-keys
```

## Uso

### 1. Obter Chave Pública VAPID

```
GET /push-subscriptions/vapid-key
```

### 2. Registrar Subscription no Cliente

```javascript
// No Service Worker do frontend
const publicKey = await fetch('/push-subscriptions/vapid-key')
  .then(res => res.json())
  .then(data => data.publicKey);

const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey)
});

// Enviar subscription para o servidor
await fetch('/push-subscriptions/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
    },
    userAgent: navigator.userAgent,
    deviceInfo: {
      // Opcional: informações do dispositivo
    }
  })
});
```

### 3. Enviar Notificação Push (via Workflow)

No workflow engine, adicione um node de tipo "notification" com ação `push_notification`:

```json
{
  "type": "push_notification",
  "config": {
    "userIds": ["userId1", "userId2"],
    "title": "Alerta de Estoque",
    "message": "O produto {{product.name}} está abaixo do estoque mínimo!",
    "icon": "/uploads/icon.png",
    "actions": [
      {
        "action": "view",
        "title": "Ver Produto"
      }
    ]
  }
}
```

## Endpoints

### POST /push-subscriptions/
Registra uma nova subscription de push para o usuário autenticado.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": {}
}
```

### DELETE /push-subscriptions/:id
Remove uma subscription específica do usuário autenticado.

### GET /push-subscriptions/user/:userId
Lista todas as subscriptions de um usuário específico.

### GET /push-subscriptions/vapid-key
Retorna a chave pública VAPID para o frontend registrar subscriptions.

## Integração com Workflow Engine

O sistema suporta ações de push notification nos workflows:

1. **Trigger**: Qualquer trigger (movement_created, stock_below_min, etc.)
2. **Condition**: (Opcional) Condições para filtrar
3. **Action**: Tipo `push_notification`

**Variáveis disponíveis no contexto:**
- `{{product.name}}` - Nome do produto
- `{{product.stock}}` - Quantidade em estoque
- `{{movement.type}}` - Tipo de movimentação
- `{{store.name}}` - Nome da loja
- `{{user.name}}` - Nome do usuário

## Limpeza Automática

Subscriptions expiradas ou inválidas são automaticamente removidas do banco quando uma tentativa de envio falha com erro 410 (expired/invalid).

## Segurança

- Todas as rotas requerem autenticação (exceto `/vapid-key`)
- As subscriptions são vinculadas ao usuário autenticado
- A chave privada VAPID nunca é exposta ao frontend
- Validação de propriedade antes de deletar subscriptions

