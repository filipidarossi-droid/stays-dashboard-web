# Stays Dashboard - Frontend

Dashboard web para visualização de ocupação, calendário e métricas de repasse da plataforma Stays.

## 🌐 URL de Produção

**Frontend**: https://stays-dashboard-web.onrender.com

## 🚀 Funcionalidades

- **Cards de Ocupação**: Métricas "Até hoje", "Futuro", "Fechamento" e "Repasse"
- **Calendário Interativo**: Visualização mensal com status de reservas
- **Tooltips**: Informações detalhadas ao passar o mouse sobre as datas
- **Auto-refresh**: Atualização automática a cada 60 segundos
- **Alertas**: Indicador 🚨 para 3+ dias vazios até hoje
- **Responsivo**: Interface adaptável para desktop e mobile

## ⚙️ Configuração

### API Base URL
O frontend está configurado para consumir a API de produção:

```javascript
// config.js
window.CONFIG = {
  API_BASE_URL: 'https://stays-dashboard-api.onrender.com',
  API_TOKEN: 'YOUR_SECURE_43_CHAR_TOKEN_HERE'
};
```

### CORS
A API está configurada para aceitar requisições apenas do frontend de produção:
```
CORS_ORIGINS=https://stays-dashboard-web.onrender.com
```

## 🚀 Deploy no Render

### Configuração do Static Site
1. **Render Dashboard** → **New** → **Static Site**
2. **Conectar repositório**: `filipidarossi-droid/stays-dashboard-api`
3. **Configurações**:
   - **Build Command**: *(vazio)*
   - **Publish Directory**: `stays-dashboard-web`
   - **Auto-Deploy**: Habilitado

### Estrutura de Arquivos
```
stays-dashboard-web/
├── index.html          # Página principal
├── config.js           # Configuração da API
├── assets/
│   ├── app.js          # Lógica do dashboard
│   └── style.css       # Estilos CSS
└── README.md           # Esta documentação
```

## 🧪 Validação

### Checklist de Funcionamento
- [ ] **Carregamento**: Página abre sem erros
- [ ] **Cards**: Exibem métricas corretas (ocupação, repasse)
- [ ] **Calendário**: Mostra reservas com cores adequadas
- [ ] **Tooltips**: Informações aparecem ao passar o mouse
- [ ] **Auto-refresh**: Atualiza a cada 60 segundos
- [ ] **Alerta 🚨**: Aparece quando há 3+ dias vazios
- [ ] **Console**: Sem erros de CORS ou JavaScript

### Teste Manual
1. Abra: https://stays-dashboard-web.onrender.com
2. Verifique se os cards carregam com dados
3. Navegue pelo calendário (setas < >)
4. Passe o mouse sobre datas com reservas
5. Aguarde 60 segundos para ver auto-refresh
6. Abra DevTools → Console (F12) para verificar erros

### Teste de CORS
No console do navegador (F12):
```javascript
fetch('https://stays-dashboard-api.onrender.com/calendario?mes=2025-08', {
  cache: 'no-store'
})
.then(r => {
  console.log('CORS Origin:', r.headers.get('access-control-allow-origin'));
  return r.json();
})
.then(data => console.log('Data:', data))
.catch(err => console.error('Error:', err));
```

**Resultado esperado:**
- `CORS Origin: https://stays-dashboard-web.onrender.com`
- `Data: {mes: "2025-08", dias: [...]}`

## 🏃‍♂️ Execução Local (Desenvolvimento)

```bash
# Opção 1 - Python
python -m http.server 4173

# Opção 2 - Node.js (recomendado)
npx serve -l 4173

# Opção 3 - Live Server (VS Code)
# Instale extensão Live Server e clique "Go Live"
```

Acesse: http://localhost:4173

## 🔧 Como Migrar para Domínio Próprio (Futuro)

### 1. Configurar Domínio Customizado
**Render** → **Static Site** → **Settings** → **Custom Domains**
- Adicionar: `dash.seudominio.com`

### 2. Configurar DNS
```
Host: dash
Tipo: CNAME
Aponta para: stays-dashboard-web.onrender.com
TTL: Automático
```

### 3. Atualizar CORS na API
```bash
# No serviço da API, atualizar variável:
CORS_ORIGINS=https://dash.seudominio.com,https://stays-dashboard-web.onrender.com
```

### 4. Atualizar config.js (se necessário)
```javascript
window.CONFIG = {
  API_BASE_URL: 'https://api.seudominio.com'  // Se API também tiver domínio próprio
};
```

### 5. Validar
```bash
curl -I https://dash.seudominio.com/
# Deve retornar 200 OK com TLS ativo
```

## 🛠️ Troubleshooting

### Dashboard não carrega
- Verifique se a API está online: https://stays-dashboard-api.onrender.com/health
- Confirme CORS no console do navegador (F12)
- Verifique se `config.js` aponta para URL correta da API

### Erro de CORS
```
Access to fetch at 'https://stays-dashboard-api.onrender.com/...' from origin 'https://...' has been blocked by CORS policy
```
**Solução**: Confirme que o domínio está em `CORS_ORIGINS` na API

### Cards vazios ou com erro
- API pode estar com problemas de autenticação
- Verifique se `API_TOKEN` no `config.js` está correto
- Confirme se endpoints da API respondem corretamente

### Auto-refresh não funciona
- Verifique console do navegador para erros JavaScript
- Confirme se não há bloqueio de rede/firewall
- Timer está configurado para 60 segundos em `app.js`

### Performance lenta
- API tem cache de 15 minutos (TTL)
- Primeira carga pode ser mais lenta (cold start do Render)
- Verifique se não há muitas requisições simultâneas

## 📱 Compatibilidade

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, tablet, mobile (responsivo)
- **Resolução**: Mínima 320px de largura

## 🔒 Segurança

- **HTTPS**: Forçado pelo Render (TLS automático)
- **CORS**: Restrito apenas à API de produção
- **Tokens**: Não expostos em logs do navegador
- **CSP**: Headers de segurança configurados pelo Render

---

**Versão**: 2.0.0  
**Última atualização**: Agosto 2025  
**Deploy**: Render Static Site  
**API**: https://stays-dashboard-api.onrender.com
