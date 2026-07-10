# Guia de configuração do Inatelinos

Passo a passo de tudo que precisa ser configurado manualmente para o app
funcionar de ponta a ponta: Firebase, Microsoft Entra ID (login com a conta
Microsoft do Inatel) e execução do app.

## Visão geral do login

O fluxo de autenticação funciona assim:

1. O app abre o login da Microsoft (OAuth 2.0 com PKCE) fixado no **tenant do
   Inatel** — somente contas da organização conseguem autenticar.
2. O app valida que o e-mail retornado é `@inatel.br` ou `@sigla.inatel.br`.
3. O usuário **confirma** a conta detectada em um modal.
4. O token da Microsoft é entregue ao **Firebase Authentication** (provedor
   OpenID Connect), que valida o token no servidor e cria a sessão.
5. No primeiro acesso, o usuário escolhe seu nome de usuário e o perfil é
   criado no Firestore.
6. As regras do Firestore/Storage reforçam **no servidor** que apenas e-mails
   do domínio Inatel acessam os dados.

---

## 1. Pré-requisitos

- Node.js LTS (≥ 18) e npm
- Android Studio com um emulador configurado (ou um dispositivo físico) —
  para iOS, um Mac com Xcode
- Uma conta Google (para o Firebase)
- Uma conta Microsoft com acesso ao [portal.azure.com](https://portal.azure.com)
  (qualquer conta serve para registrar o aplicativo; ver observação no passo 3)

Instale as dependências do projeto:

```bash
npm install
```

## 2. Criar o projeto no Firebase

> O projeto original apontava para o Firebase do autor do clone. Você
> **precisa** de um projeto próprio, pois o provedor OIDC (passo 4) é
> configurado no console do Firebase.

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
   e crie um projeto (ex.: `inatelinos`).
2. Adicione um **app Web** (ícone `</>`), dê um apelido (ex.: `inatelinos-app`)
   e copie o objeto `firebaseConfig` exibido — você vai colocar esses valores
   no `.env` (passo 5).
3. **Firestore**: menu *Build → Firestore Database → Create database* (modo
   produção). Depois, em *Rules*, cole o conteúdo de
   [`src/services/firebase.rules`](src/services/firebase.rules) e publique.
4. **Storage**: menu *Build → Storage → Get started*. Em *Rules*, cole o
   conteúdo de [`src/services/firestore.rules`](src/services/firestore.rules)
   e publique.

## 3. Registrar o aplicativo no Microsoft Entra ID (Azure)

1. Acesse [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID**
   → **App registrations** → **New registration**.
2. Preencha:
   - **Name**: `Inatelinos`
   - **Supported account types**:
     - Se você tem acesso administrativo ao tenant do Inatel, escolha
       *"Accounts in this organizational directory only"*.
     - Se está registrando o app em **outro** tenant (ex.: sua conta de
       desenvolvedor), escolha *"Accounts in any organizational directory"*
       (multitenant). O app já restringe o login ao tenant do Inatel, então
       na prática só contas do Inatel entram.
   - **Redirect URI**: selecione a plataforma **"Mobile and desktop
     applications"** e informe manualmente: `inatelinos://auth`
3. Após criar, anote o **Application (client) ID** (GUID) da página *Overview*.
4. Em *API permissions*, confirme que existem as permissões delegadas do
   Microsoft Graph: `openid`, `profile`, `email` (e `User.Read`, que vem por
   padrão). São permissões básicas que não exigem consentimento de
   administrador na maioria das organizações.

### 3.1 Descobrir o Tenant ID do Inatel

O tenant ID é público. Abra no navegador:

```
https://login.microsoftonline.com/inatel.br/v2.0/.well-known/openid-configuration
```

No JSON retornado, o campo `issuer` tem o formato
`https://login.microsoftonline.com/<TENANT_ID>/v2.0` — o GUID no meio é o
**Tenant ID do Inatel**. Anote o issuer completo também: ele será usado no
Firebase.

> ⚠️ Se a organização do Inatel restringir o consentimento de aplicativos de
> terceiros, pode ser necessário pedir ao administrador de TI do Inatel que
> aprove o aplicativo (ou que registre o app dentro do próprio tenant).

## 4. Habilitar o provedor OpenID Connect no Firebase

1. No console do Firebase: *Build → Authentication → Sign-in method →
   Add new provider → OpenID Connect*.
   - Se o console pedir upgrade para o **Identity Platform**, aceite (o plano
     gratuito cobre o uso normal).
2. Preencha:
   - **Grant type / Response type**: `ID token` (fluxo implícito — não requer
     client secret; o app obtém o token via code+PKCE e o entrega ao Firebase)
   - **Name**: `Microsoft` → o ID gerado deve ser **`oidc.microsoft`**
     (precisa bater com `EXPO_PUBLIC_FIREBASE_OIDC_PROVIDER_ID` do `.env`)
   - **Client ID**: o *Application (client) ID* do passo 3
   - **Issuer (URL)**: `https://login.microsoftonline.com/<TENANT_ID>/v2.0`
     (o issuer exato descoberto no passo 3.1 — **não** use `common` ou
     `organizations`, o Firebase exige issuer fixo)
3. Salve.

## 5. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com:

| Variável | Onde obter |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` etc. | Objeto `firebaseConfig` do passo 2.2 |
| `EXPO_PUBLIC_AZURE_CLIENT_ID` | *Application (client) ID* do passo 3.3 |
| `EXPO_PUBLIC_AZURE_TENANT_ID` | Tenant ID do Inatel (passo 3.1) |
| `EXPO_PUBLIC_FIREBASE_OIDC_PROVIDER_ID` | `oidc.microsoft` (padrão) |

O arquivo `.env` está no `.gitignore` — não faça commit dele.

## 6. Rodar o app

O login com a Microsoft usa o scheme nativo `inatelinos://` e por isso **não
funciona no Expo Go** — use um *development build*:

```bash
# Regenera as pastas nativas com o novo pacote (br.inatel.inatelinos),
# nome (Inatelinos), ícones e o scheme inatelinos://
npx expo prebuild --clean

# Android (emulador aberto ou dispositivo conectado)
npx expo run:android

# iOS (somente em um Mac)
npx expo run:ios
```

Nas execuções seguintes, basta `npx expo start --dev-client`.

## 7. Checklist de verificação

- [ ] Tela de login mostra o logotipo Inatelinos e o botão "Entrar com a Microsoft"
- [ ] O botão abre a página de login da Microsoft já restrita à organização
- [ ] Login com conta fora do Inatel (ex.: Gmail/Outlook pessoal) é recusado
- [ ] Após autenticar, aparece o modal "Conta Inatel verificada!" com o e-mail
- [ ] Ao confirmar, no primeiro acesso abre a tela "Complete seu perfil"
- [ ] Depois de criar o perfil, o feed abre normalmente

## Solução de problemas

| Sintoma | Causa provável / correção |
|---|---|
| `auth/operation-not-allowed` | O provedor OIDC não foi criado/habilitado no Firebase (passo 4) |
| `auth/invalid-credential` | Issuer ou Client ID do provedor OIDC não batem com o registro do Azure — confira o passo 4.2 |
| `AADSTS50194` / erro de tenant | `EXPO_PUBLIC_AZURE_TENANT_ID` não é o GUID do tenant do Inatel, ou o app foi registrado como *single tenant* em outro tenant |
| `AADSTS500113` / redirect inválido | O redirect URI `inatelinos://auth` não foi cadastrado na plataforma *Mobile and desktop applications* do registro no Azure |
| Navegador abre e volta sem logar | Rodando no Expo Go — use `npx expo run:android` (passo 6) |
| Aviso "Configuração do Firebase ausente" no terminal | `.env` não existe ou o Expo não foi reiniciado após criá-lo (`npx expo start -c`) |

## Limitações conhecidas (herdadas do projeto original)

- A unicidade do nome de usuário não é verificada na criação do perfil.
- O documento do usuário usa o e-mail como ID no Firestore.
- A foto de perfil inicial é gerada com as iniciais do nome via
  [ui-avatars.com](https://ui-avatars.com) (pode ser trocada em *Editar perfil*).
