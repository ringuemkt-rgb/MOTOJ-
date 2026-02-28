# MotoJá — SuperApp de Mototáxi & Entregas (Ituberá–BA) 🏍️

Monorepo profissional com **3 plataformas**:
- **Passenger App (Android Flutter)** — Passageiro solicita corridas/entregas, acompanha no mapa.
- **Driver App (Android Flutter)** — Motorista fica online, recebe ofertas, executa corridas.
- **Admin Web (PC)** — Gestão operacional, preços, motoristas, métricas e Central IA.

> **Modelo de negócio (padrão):** 20% plataforma / 80% motorista  
> **Tarifa mínima:** R$ 12,00 (configurável no Admin)

---

## 📦 Estrutura do repositório

```txt
motoja/
  apps/
    passenger_app/      # Flutter Android (passageiro)
    driver_app/         # Flutter Android (motorista)
    admin_web/          # Flutter Web (painel admin)
  shared/
    assets/             # logo, ícones 3D, ilustrações
    lib/                # design system + utilitários compartilhados
  firebase/
    firestore.rules     # regras de segurança
    firestore.indexes.json
    functions/          # backend (Cloud Functions) - opcional/placeholder
  docs/
    SETUP_PC_BUILD.md
    SETUP_GOOGLE_MAPS.md
    SETUP_FIREBASE.md
    FIRESTORE_SCHEMA.md
    RELEASE_PLAYBOOK.md
  .github/
    workflows/          # CI/CD (se aplicável)
  README.md
```

---

## ✅ Requisitos (PC)

### Obrigatório

- Flutter (stable)
- Android Studio (Android SDK + Platform Tools)
- JDK 17
- Git

Verifique o ambiente:

```bash
flutter doctor -v
```

---

## 🚀 Rodar o Passenger App (Android)

```bash
cd apps/passenger_app
flutter pub get
flutter run
```

---

## 🗺️ Google Maps (obrigatório)

1) Ative as APIs no Google Cloud

- Maps SDK for Android
- Directions API (Polyline)
- Places API (autocomplete — recomendado)

2) Coloque a API Key no AndroidManifest

Arquivo: `apps/passenger_app/android/app/src/main/AndroidManifest.xml`

Dentro de `<application>`:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="SUA_GOOGLE_MAPS_KEY_AQUI"/>
```

3) Permissões

No mesmo manifest:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

> Veja também: `docs/SETUP_GOOGLE_MAPS.md`

---

## 🔥 Firebase (Auth + Firestore + FCM)

1) Crie um projeto no Firebase e ative:

- Authentication (Phone OTP recomendado)
- Firestore
- Cloud Messaging (FCM) (ofertas/notificações)
- Functions (opcional)

2) Conecte o Flutter ao Firebase (recomendado)

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

Isso gera `firebase_options.dart` e configura automaticamente o Android.

> Veja também: `docs/SETUP_FIREBASE.md`

3) Regras de segurança (Firestore Rules)

Arquivo: `firebase/firestore.rules`

**IMPORTANTE:** não publique com regras abertas.

---

## 🧱 Build APK (Release)

Dentro do app que você quer compilar:

```bash
cd apps/passenger_app
flutter pub get
flutter build apk --release
```

O APK final fica em:

```txt
build/app/outputs/flutter-apk/app-release.apk
```

---

## 🌐 Rodar / Deploy do Admin Web

Rodar local:

```bash
cd apps/admin_web
flutter pub get
flutter run -d chrome
```

Build:

```bash
flutter build web
```

Você pode publicar o `/build/web` em:

- Firebase Hosting
- Vercel / Netlify
- GitHub Pages (com config)

---

## 🧠 Central IA (Operações & Lucro)

O sistema possui estrutura para “Torre de Controle”:

- métricas de oferta/demanda
- recomendação de preço (chuva/pico)
- alertas operacionais (falta de moto em região)
- insights para retenção e redução de cancelamentos

> Implementação e roadmap: `docs/RELEASE_PLAYBOOK.md` + `docs/FIRESTORE_SCHEMA.md`

---

## 🧾 Firestore Schema (Visão geral)

Coleções principais sugeridas:

- `users/{uid}`
- `drivers/{uid}`
- `rides/{rideId}`
- `ride_events/{rideId}/events/{eventId}`
- `admin_settings/pricing`
- `metrics_hourly/{YYYYMMDDHH}`
- `ai_recommendations/{id}`

> Detalhado em: `docs/FIRESTORE_SCHEMA.md`

---

## 🧪 Troubleshooting (os erros clássicos)

### Mapa não aparece (tela cinza)

- API Key inválida ou APIs não ativadas no Google Cloud
- Meta-data fora de `<application>`
- Falta de billing ativo na conta GCP (quando exigido)

### Erro Gradle/JDK

Configure JDK 17 no Android Studio:

`Settings → Build Tools → Gradle → Gradle JDK = 17`

### Firebase não inicializa

- `flutterfire configure` não foi rodado
- `google-services.json` ausente em `android/app/`

---

## ✅ Checklist “Pronto pra Lançar” (Uber/99 básico)

### Passageiro

- [ ] Login por telefone (OTP)
- [ ] Selecionar destino (Places)
- [ ] Preço + ETA antes de pedir
- [ ] Tracking em tempo real do motorista
- [ ] Finalizar e avaliar corrida

### Motorista

- [ ] Online/offline
- [ ] Receber oferta (FCM/stream)
- [ ] Aceitar/recusar com timer
- [ ] Iniciar/finalizar corrida
- [ ] Ganhos do dia

### Admin

- [ ] Corridas ao vivo
- [ ] Motoristas online
- [ ] Ajuste de tarifa (mínimo R$ 12)
- [ ] Bloquear/aprovar motorista
- [ ] Logs e auditoria

---

## 📌 Licença

Defina aqui sua licença (ex: Proprietária / MIT / etc.)

---

## 🤝 Contato / Operação

Projeto piloto: Ituberá–BA (Baixo Sul)  
Dúvidas operacionais: abrir issue no repositório ou contato do administrador.

---

## ✅ Como aplicar no GitHub (rápido)

1) Abra seu repo → **Add file → Create new file**  
2) Nome: `README.md`  
3) Cole o conteúdo acima  
4) Commit

Se você quiser, eu também crio um **`docs/SETUP_PC_BUILD.md`** ultra mastigado (passo-a-passo Windows) + um **`RELEASE_PLAYBOOK.md`** com assinatura de APK e Play Console.
