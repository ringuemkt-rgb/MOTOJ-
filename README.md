# MotoJá Premium 🏍️

Aplicativo web mobile-first para operação de mototáxi/entregas com:
- Mapa em tempo real (Leaflet + geolocalização)
- Central IA (Gemini) com chat e voz
- Fluxo de pagamento visual
- Instalação como app (PWA)

> Este repositório **não é um monorepo Flutter** no estado atual. É uma aplicação única em **React + Vite + TypeScript**.

## Estrutura atual

```txt
MOTOJ-/
  index.tsx
  index.html
  service-worker.js
  manifest.json
  icon.svg
  docs/
    SETUP_PC_BUILD.md
    RELEASE_PLAYBOOK.md
  package.json
  vite.config.ts
```

## 1) Setup rápido (PC)

Pré-requisitos:
- Node.js 20+
- npm 10+

```bash
npm install
cp .env.example .env.local
# edite .env.local e informe a chave Gemini
npm run dev
```

Abra: `http://localhost:3000`

## 2) Variáveis de ambiente

Crie `.env.local` com:

```bash
VITE_GEMINI_API_KEY=sua_chave_gemini
```

Sem esta chave, a Central IA abre, mas responde com aviso de configuração.

## 3) Build para ativação

```bash
npm run build
npm run preview
```

A pasta de saída é `dist/`.

## 4) Instalação como aplicativo (PWA)

O projeto já possui:
- `manifest.json`
- `service-worker.js`
- registro do service worker no `index.tsx`

Para instalar:
- **Android (Chrome):** abrir a URL publicada → menu ⋮ → **Adicionar à tela inicial**
- **Desktop (Chrome/Edge):** ícone de instalação na barra de endereço

## 5) Deploy

Publique o conteúdo de `dist/` em qualquer host estático:
- Firebase Hosting
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

## 6) Funcionalidades prontas x pendentes

Pronto no código atual:
- UI mobile premium
- tracking de posição do usuário
- chat IA (texto)
- voz IA (stream)
- PWA instalável

Para produção (recomendado):
- backend de corridas (matching, status, histórico)
- autenticação (OTP)
- gateway real de pagamentos
- observabilidade/logs
- políticas LGPD e segurança

## 7) Troubleshooting

### `npm install` falha com 403
Bloqueio de registry/rede corporativa. Ajuste proxy/allowlist do NPM para `@google/genai`.

### Mapa não move
Permissão de localização negada no navegador/dispositivo.

### IA não responde
Verifique `VITE_GEMINI_API_KEY` no `.env.local`.

---

Mais detalhes operacionais em:
- `docs/SETUP_PC_BUILD.md`
- `docs/RELEASE_PLAYBOOK.md`
