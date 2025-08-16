# Stays Dashboard Web

Frontend dashboard para visualização de dados da plataforma Stays, consumindo a API deployada no Render.

## 🚀 Funcionalidades

- **Dashboard em tempo real** com atualização automática a cada 60 segundos
- **Cards de métricas**: Ocupação "Até hoje", "Futuro", "Fechamento" e "Repasse do mês"
- **Calendário visual** com indicadores de ocupação e status das reservas
- **Sistema de alertas** (🚨) para 3+ dias consecutivos sem reservas
- **Tooltips informativos** com detalhes das reservas ao passar o mouse
- **Design responsivo** e tema dark moderno
- **Tratamento de erros** com fallbacks visuais

## 📋 Pré-requisitos

- Navegador web moderno
- Acesso à internet para consumir a API
- API Stays Dashboard rodando em: https://stays-dashboard-api.onrender.com

## 🛠️ Instalação e Execução Local

### 1. Clone o repositório
```bash
git clone https://github.com/filipidarossi-droid/stays-dashboard-web.git
cd stays-dashboard-web
```

### 2. Configurar API (se necessário)
Edite o arquivo `config.js` para ajustar a URL da API:
```javascript
window.CONFIG = {
  API_BASE_URL: 'https://stays-dashboard-api.onrender.com',
  API_TOKEN: 'seu-token-aqui',
  REFRESH_INTERVAL: 60000, // 60 segundos
  CURRENT_MONTH: '2025-08'
};
```

### 3. Executar localmente

**Opção A - Python (recomendado):**
```bash
python -m http.server 8080
```

**Opção B - Node.js:**
```bash
npx serve . -p 8080
```

**Opção C - PHP:**
```bash
php -S localhost:8080
```

### 4. Acessar o dashboard
Abra o navegador em: http://localhost:8080

## 🚀 Deploy no Render

### 1. Conectar repositório
- Acesse [Render](https://render.com)
- Clique em "New" → "Static Site"
- Conecte sua conta GitHub
- Selecione o repositório `stays-dashboard-web`

### 2. Configurar o Static Site
- **Name**: `stays-dashboard-web`
- **Branch**: `main`
- **Root Directory**: `.` (raiz)
- **Build Command**: (deixe vazio)
- **Publish Directory**: `.` (raiz)

### 3. Deploy automático
- Habilite "Auto-Deploy" para deploy automático a cada push
- O site ficará disponível em: `https://stays-dashboard-web.onrender.com`

### 4. Configurar CORS na API
Após o deploy, atualize as configurações de CORS na API para incluir o domínio do frontend:

```python
# No arquivo main.py da API
CORS_ORIGINS = [
    "https://stays-dashboard-web.onrender.com",
    "http://localhost:8080",
    "http://localhost:3000"
]
```

## 📊 Estrutura do Projeto

```
stays-dashboard-web/
├── index.html          # Página principal do dashboard
├── config.js           # Configurações da API e parâmetros
├── assets/
│   ├── style.css       # Estilos CSS (tema dark)
│   └── app.js          # Lógica JavaScript principal
└── README.md           # Este arquivo
```

## 🔧 Configuração da API

### Endpoints Consumidos
- `GET /calendario?mes=YYYY-MM` - Dados do calendário mensal
- `GET /repasse?mes=YYYY-MM&incluir_limpeza=true` - Cálculos de repasse

### Autenticação
Todos os endpoints requerem Bearer Token:
```javascript
headers: {
    'Authorization': 'Bearer SEU_TOKEN',
    'Content-Type': 'application/json'
}
```

## 🔔 Configuração do Webhook Stays

Para receber atualizações em tempo real da plataforma Stays:

### 1. Endpoint do Webhook
```
URL: https://stays-dashboard-api.onrender.com/webhooks/stays
Método: POST
Content-Type: application/json
```

### 2. Configuração na Stays
1. Acesse o painel administrativo da Stays
2. Vá em "Configurações" → "Webhooks" → "Adicionar Webhook"
3. Configure:
   - **URL**: `https://stays-dashboard-api.onrender.com/webhooks/stays`
   - **Método**: `POST`
   - **Eventos**: `reservation_created`, `reservation_updated`, `reservation_cancelled`
   - **Token de Autenticação**: `Bearer SEU_API_TOKEN`

### 3. Payload de Exemplo
```json
{
  "event": "reservation_updated",
  "reservation_id": "RES123",
  "listing_id": "1",
  "timestamp": "2025-08-16T13:00:00Z",
  "data": {
    "checkin": "2025-08-20",
    "checkout": "2025-08-25",
    "guest_name": "João Silva",
    "total_amount": 1250.00
  }
}
```

### 4. Teste do Webhook
```bash
curl -X POST https://stays-dashboard-api.onrender.com/webhooks/stays \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "timestamp": "2025-08-16T13:00:00Z"}'
```

## 📱 Funcionalidades do Dashboard

### Cards de Métricas
- **Até Hoje**: Percentual e fração de ocupação desde o dia 1 até hoje
- **Futuro**: Percentual e fração de ocupação dos dias restantes do mês
- **Fechamento**: Percentual e fração de ocupação total do mês
- **Repasse**: Valor estimado, status e meta mensal

### Calendário Interativo
- **Dias ocupados**: Fundo verde com status da reserva
- **Dias vazios**: Fundo vermelho
- **Dia atual**: Borda dourada destacada
- **Alertas**: 🚨 para 3+ dias consecutivos vazios (do dia 1 até hoje)
- **Tooltips**: Informações detalhadas ao passar o mouse

### Sistema de Alertas
O sistema detecta automaticamente sequências de 3 ou mais dias consecutivos sem reservas, contando do dia 1 até o dia atual, e exibe o ícone 🚨 nesses dias.

### Auto-refresh
- Atualização automática a cada 60 segundos
- Pausa quando a aba não está visível (economia de recursos)
- Retoma automaticamente quando a aba volta a ficar ativa
- Indicador visual de status da conexão

## 🎨 Personalização

### Alterar Tema
Edite `assets/style.css` para personalizar cores:
```css
:root {
  --primary-color: #60a5fa;
  --success-color: #10b981;
  --error-color: #ef4444;
  --background: #0f0f23;
}
```

### Alterar Intervalo de Atualização
Edite `config.js`:
```javascript
REFRESH_INTERVAL: 30000, // 30 segundos
```

### Alterar Mês Exibido
Edite `config.js`:
```javascript
CURRENT_MONTH: '2025-09' // Setembro 2025
```

## 🐛 Troubleshooting

### Dashboard não carrega dados
1. Verifique se a API está online: https://stays-dashboard-api.onrender.com/health
2. Confirme o token de autenticação em `config.js`
3. Verifique o console do navegador para erros de CORS

### Erro de CORS
1. Confirme que o domínio do frontend está configurado na API
2. Verifique se o protocolo (http/https) está correto
3. Teste localmente primeiro

### Auto-refresh não funciona
1. Verifique se há erros no console
2. Confirme que a aba está ativa
3. Teste manualmente recarregando a página

### Alertas não aparecem
1. Verifique se há pelo menos 3 dias consecutivos vazios
2. Confirme que a contagem é do dia 1 até hoje
3. Verifique os dados retornados pela API

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do navegador (F12 → Console)
2. Teste a API diretamente: `curl https://stays-dashboard-api.onrender.com/health`
3. Confirme as configurações de CORS na API
4. Verifique se o webhook está configurado corretamente na Stays

## 🔄 Atualizações

Para atualizar o dashboard:
1. Faça as alterações no código
2. Commit e push para o repositório
3. O Render fará deploy automático
4. Verifique se não há erros de build nos logs do Render

## 📈 Monitoramento

O dashboard inclui:
- Indicador de status da conexão (bolinha verde/vermelha)
- Timestamp da última atualização
- Mensagens de erro visíveis
- Loading states durante atualizações
- Logs detalhados no console do navegador

## 🔐 Segurança

- Token de API configurado via arquivo de configuração
- Não exposição de credenciais no código
- CORS configurado adequadamente
- Validação de dados recebidos da API
