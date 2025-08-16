# Stays Dashboard — Web (Frontend)

Site estático que consome a **Stays Dashboard API** e renderiza um calendário com indicadores.

## 🔗 Produção
- API: https://stays-dashboard-api.onrender.com
- Configure a base da API em `config.js`.

## 🚀 Rodando localmente
```bash
# opção 1 — com python
python -m http.server 4173

# opção 2 — com npx (recomendado)
npx serve -l 4173
```
Acesse http://localhost:4173

## 🧩 Estrutura
```
index.html
assets/
  app.js
  style.css
config.js
```

## 🔄 Atualização automática
O dashboard faz polling a cada **60 segundos** e também tem um botão ↻ para atualizar manualmente.

## 🧯 Lógica da sirene
A sirene 🚨 aparece **acima do dia** quando existem **3+ dias consecutivos sem reserva** desde o dia 1 **até hoje**. Ela para assim que entrar reserva.

## 🛠️ Deploy (Render — Static Site)
1. No Render, clique **New → Static Site**.
2. Conecte ao repositório deste projeto.
3. **Build Command**: (deixe vazio)  
   **Publish Directory**: `.`
4. Finalize. A URL pública será algo como `https://stays-dashboard-web.onrender.com`.

## 🔐 CORS
Deixe a API aceitar o domínio do seu site na configuração CORS do backend.

## 📌 Notas de integração
- `GET /calendario` deve retornar uma lista de dias com `date` (YYYY-MM-DD) e `reserved` (boolean). Campos extras (ex.: `tooltip`) aparecem como *title* no hover.
- `GET /repasse` retorna um objeto com `total` (número) e `obs` (string). O parser é tolerante a variações (`valor`, `repasse`, etc).

Se o shape for diferente, ajuste a função `normalizeCalendar` em `assets/app.js`.

## 🔗 Webhook da Stays

Para configurar webhooks na plataforma Stays e manter o dashboard atualizado em tempo real:

### URL do Webhook
```
https://stays-dashboard-api.onrender.com/webhooks/stays
```

### Configuração
1. **Método**: POST
2. **Content-Type**: application/json
3. **Autenticação**: Bearer token (mesmo token da API)
4. **Eventos**: Reservas criadas, modificadas, canceladas

### Exemplo de configuração na Stays
```bash
# Teste do webhook
curl -X POST https://stays-dashboard-api.onrender.com/webhooks/stays \
  -H "Authorization: Bearer test-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"event": "reservation.created", "data": {...}}'
```

### Comportamento
- O webhook limpa o cache da API automaticamente
- O dashboard detecta mudanças na próxima atualização (máximo 60s)
- Para atualizações instantâneas, implemente Server-Sent Events (SSE) no futuro
