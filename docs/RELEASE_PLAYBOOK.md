# Release Playbook — MotoJá Premium

## Pré-release
- [ ] Branch atualizada e revisada
- [ ] `.env.local` com chave válida em ambiente de staging
- [ ] `npm run build` concluído
- [ ] `npm run preview` validado

## Testes manuais críticos
- [ ] Fluxo onboarding → mapa
- [ ] Tracking de geolocalização ativo
- [ ] Menu lateral e modal de pagamento
- [ ] IA chat: pergunta e resposta
- [ ] IA voz: captura microfone e retorno de áudio
- [ ] Instalação PWA em Android e desktop

## Deploy
1. Gerar artefato:
   ```bash
   npm run build
   ```
2. Publicar `dist/` no provedor escolhido.
3. Invalidar cache/CDN se necessário.

## Pós-deploy
- [ ] Smoke test em produção
- [ ] Verificar erros no console/browser
- [ ] Confirmar prompt de instalação PWA

## Rollback
- Reverter para último build estável no host estático.
