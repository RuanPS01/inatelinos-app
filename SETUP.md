# Guia de configuração do Inatelinos

Passo a passo de tudo que precisa ser configurado manualmente para o app
funcionar de ponta a ponta.

## Visão geral do acesso

1. O cadastro só aceita e-mails institucionais do Inatel: `@inatel.br` ou
   `@sigla.inatel.br` (qualquer sigla de curso que o Inatel venha a criar).
2. Ao criar a conta, o Firebase envia um **link de confirmação** para o
   e-mail informado. O app fica bloqueado na tela "Confirme seu e-mail" até o
   link ser aberto — ou seja, só entra quem realmente tem acesso à caixa de
   entrada do Inatel.
3. Após a confirmação, o usuário escolhe o nome de usuário e o perfil é
   criado no Firestore.
4. As regras do Firestore/Storage reforçam **no servidor** as duas condições:
   domínio Inatel **e** e-mail confirmado (`email_verified`).

> 💡 **Login com a Microsoft (futuro):** o código do login integrado com a
> conta Microsoft do Inatel está pronto e preservado no projeto
> (`src/hooks/useMicrosoftAuth.js`, `src/components/login/MicrosoftLogin.jsx`
> e `src/services/authConfig.js`), mas não está ligado às telas. Quando
> quiser ativá-lo, veja a seção "Opcional: login Microsoft" no fim deste guia.

---

## 1. Pré-requisitos

- Node.js LTS (≥ 18) e npm
- Android Studio com um emulador configurado (ou um dispositivo físico) —
  para iOS, um Mac com Xcode
- Uma conta Google (para o Firebase)

Instale as dependências do projeto:

```bash
npm install
```

## 2. Criar o projeto no Firebase

> O projeto original apontava para o Firebase do autor do clone. Você
> **precisa** de um projeto próprio para controlar a autenticação e os dados.

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
   e crie um projeto (ex.: `inatelinos`).
2. Adicione um **app Web** (ícone `</>`), dê um apelido (ex.: `inatelinos-app`)
   e copie o objeto `firebaseConfig` exibido — você vai colocar esses valores
   no `.env` (passo 4).
3. **Firestore**: menu *Build → Firestore Database → Create database* (modo
   produção). Depois, em *Rules*, cole o conteúdo de
   [`src/services/firebase.rules`](src/services/firebase.rules) e publique.
4. **Storage**: menu *Build → Storage → Get started*. Em *Rules*, cole o
   conteúdo de [`src/services/firestore.rules`](src/services/firestore.rules)
   e publique.

## 3. Habilitar o login por e-mail/senha e a confirmação de e-mail

1. No console do Firebase: *Build → Authentication → Get started*.
2. Na aba **Sign-in method**, habilite o provedor **Email/Password**
   (apenas o primeiro toggle; "Email link" não é necessário).
3. Na aba **Templates**, selecione o modelo **Email address verification** e:
   - Clique no lápis e ajuste o idioma do template (ícone de idioma no
     rodapé da página) para **Português (Brasil)**, se desejar;
   - Opcionalmente personalize o remetente/assunto.
4. (Recomendado) Em *Authentication → Settings → User actions*, deixe
   **desmarcada** a opção "Email enumeration protection" se quiser mensagens
   de erro mais específicas no login — ou deixe marcada para mais segurança
   (o app já trata os dois casos).

> A validação do domínio Inatel acontece no app **e** nas regras do
> Firestore/Storage. O Firebase Authentication em si não bloqueia a criação
> de contas com outros domínios, mas essas contas nunca passam da tela de
> confirmação e não conseguem ler nem gravar nenhum dado.

## 4. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com os valores do `firebaseConfig` copiado no passo 2.2
(`EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.).
As variáveis `EXPO_PUBLIC_AZURE_*` são só para o futuro login Microsoft e
podem ficar vazias.

O arquivo `.env` está no `.gitignore` — não faça commit dele.

## 5. Rodar o app

```bash
# Regenera as pastas nativas com o novo pacote (br.inatel.inatelinos),
# nome (Inatelinos) e ícones
npx expo prebuild --clean

# Android (emulador aberto ou dispositivo conectado)
npx expo run:android

# iOS (somente em um Mac)
npx expo run:ios
```

Nas execuções seguintes, basta `npx expo start --dev-client`.

> O fluxo de cadastro/login por e-mail e senha também funciona no **Expo Go**
> (`npx expo start`), útil para testar rápido — mas o acesso à galeria no
> Android exige o development build acima.

## 6. Checklist de verificação

- [ ] Tela de login mostra o logotipo Inatelinos e os campos de e-mail/senha
- [ ] Cadastro recusa e-mails fora do domínio (ex.: gmail.com) com aviso claro
- [ ] Cadastro com `@inatel.br` ou `@sigla.inatel.br` cria a conta e cai na
      tela "Confirme seu e-mail"
- [ ] O e-mail de confirmação chega na caixa de entrada (ou spam)
- [ ] Sem confirmar, o app não avança (mesmo fechando e abrindo de novo)
- [ ] Após clicar no link, o app detecta sozinho (ou pelo botão "Já
      confirmei") e abre a tela "Complete seu perfil"
- [ ] Depois de criar o perfil, o feed abre normalmente
- [ ] "Esqueceu a senha?" envia o e-mail de redefinição

## Solução de problemas

| Sintoma | Causa provável / correção |
|---|---|
| `auth/operation-not-allowed` ao cadastrar | O provedor Email/Password não foi habilitado (passo 3.2) |
| E-mail de confirmação não chega | Confira spam/lixo eletrônico; aguarde alguns minutos; use "Reenviar e-mail" |
| "Já confirmei" diz que não confirmou | O link abre no navegador — confirme que apareceu a página "email verificado" do Firebase antes de voltar ao app |
| `permission-denied` no Firestore após confirmar | As regras publicadas não são as de `src/services/firebase.rules`, ou o token ainda não renovou — toque em "Já confirmei" novamente |
| Aviso "Configuração do Firebase ausente" no terminal | `.env` não existe ou o Expo não foi reiniciado após criá-lo (`npx expo start -c`) |
| Muitos reenvios → `auth/too-many-requests` | Limite anti-abuso do Firebase; aguarde alguns minutos |

## Limitações conhecidas

- A unicidade do nome de usuário não é verificada na criação do perfil
  (herdado do projeto original).
- O documento do usuário usa o e-mail como ID no Firestore.
- A foto de perfil inicial é gerada com as iniciais do nome via
  [ui-avatars.com](https://ui-avatars.com) (pode ser trocada em *Editar perfil*).
- Qualquer pessoa pode *tentar* se cadastrar com um e-mail do Inatel que não
  é dela, mas a conta fica inutilizável: sem abrir o link de confirmação (que
  chega apenas na caixa de entrada verdadeira) nada é liberado.

---

## Opcional: login Microsoft (para o futuro)

Quando quiser ativar o login integrado com a conta Microsoft institucional
(valida a conta direto no Microsoft 365 do Inatel, sem senha própria):

1. Registre um aplicativo no [portal.azure.com](https://portal.azure.com)
   (Microsoft Entra ID → App registrations) com redirect URI
   `inatelinos://auth` na plataforma *Mobile and desktop applications*.
2. Descubra o Tenant ID do Inatel em
   `https://login.microsoftonline.com/inatel.br/v2.0/.well-known/openid-configuration`
   (GUID no campo `issuer`).
3. No Firebase, em *Authentication → Sign-in method*, adicione um provedor
   **OpenID Connect** (response type `ID token`) com ID `oidc.microsoft`,
   o Client ID do Azure e o Issuer
   `https://login.microsoftonline.com/<TENANT_ID>/v2.0`.
4. Preencha `EXPO_PUBLIC_AZURE_CLIENT_ID` e `EXPO_PUBLIC_AZURE_TENANT_ID`
   no `.env`.
5. Reative o componente na tela de login: importe e renderize
   `MicrosoftLogin` (de `src/components/login/MicrosoftLogin.jsx`) em
   `src/screens/Login.jsx`.

Detalhe: esse fluxo usa o scheme nativo `inatelinos://` e não funciona no
Expo Go — apenas em development build (`npx expo run:android`).
