# Setup PC + Build (MotoJá Premium)

## Requisitos
- Node.js 20+
- npm 10+
- Navegador Chrome/Edge atualizado

## Passo a passo
1. Instalar dependências:
   ```bash
   npm install
   ```
2. Configurar ambiente:
   ```bash
   cp .env.example .env.local
   ```
3. Editar `.env.local` e incluir `VITE_GEMINI_API_KEY`.
4. Rodar local:
   ```bash
   npm run dev
   ```
5. Build de produção:
   ```bash
   npm run build
   ```
6. Validar build local:
   ```bash
   npm run preview
   ```

## Entregável para publicação
- Pasta `dist/`

## Checklist técnico mínimo
- [ ] App abre no mobile sem erro
- [ ] Permissão de geolocalização funciona
- [ ] Chat IA responde
- [ ] Instalação PWA disponível
