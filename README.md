# Inatelinos 📡

A rede social exclusiva de alunos e ex-alunos do **Inatel** — Instituto
Nacional de Telecomunicações. Feed, stories, reels, chat e tudo que se espera
de uma rede social moderna, restrita à comunidade inatelina.

Construído com **React Native + Expo** e **Firebase**, com login integrado à
conta **Microsoft institucional** (`@inatel.br` / `@sigla.inatel.br`).

## Acesso exclusivo Inatel 🔐

- Cadastro **apenas** com e-mail institucional: `@inatel.br` e variações
  `@sigla.inatel.br` (qualquer sigla de curso que o Inatel venha a criar).
- A conta só é liberada após o usuário **confirmar o link enviado ao
  e-mail** — ou seja, é preciso ter acesso real à caixa de entrada do Inatel.
- A restrição de domínio e a exigência de e-mail confirmado também são
  aplicadas **no servidor**, pelas regras do Firestore e do Storage.
- Login integrado com a conta Microsoft do Inatel: código pronto e
  preservado no projeto para ativação futura (ver seção opcional do
  [SETUP.md](SETUP.md)).

## Identidade visual 🎨

A paleta deriva do azul institucional do Inatel **`#1E60AD`**
(definida em [`src/constants/COLORS.js`](src/constants/COLORS.js)):

| Papel | Cor |
|---|---|
| Primária (azul Inatel) | `#1E60AD` |
| Escuro / pressionado | `#154379` |
| Acento (ícones ativos) | `#4581C4` |
| Links | `#6FA3D9` |
| Realce (anel de stories) | `#7FD4FF` |
| Escala completa | `#E8F0F9` → `#0B2440` |

O logotipo é a **antena transmitindo**: a moldura arredondada de um app de
fotos com ondas de transmissão no centro — e, no wordmark, o pingo do primeiro
"i" de *inatelinos* vira a antena.

## Funcionalidades 🚀

Inspiradas no funcionamento do Instagram:

- Feed de posts com curtidas, comentários e salvos
- Stories (com anel azul Inatel) e destaques
- Reels com vídeo
- Chat entre inatelinos
- Perfil com seguidores/seguindo, solicitações e edição completa
- Busca de usuários e explorar
- Notificações de interações
- Compartilhamento de perfil com QR code

## Tecnologias 💻

- React Native 0.79 + Expo SDK 53
- Firebase Authentication (e-mail/senha + verificação obrigatória de e-mail)
- Cloud Firestore + Firebase Storage
- React Navigation, Reanimated, Gesture Handler, Bottom Sheet
- expo-auth-session / expo-crypto (reservados para o futuro login Microsoft)

## Como rodar 🛠️

O passo a passo completo de configuração (Firebase, registro do app no Azure,
variáveis de ambiente e build) está no **[SETUP.md](SETUP.md)**. Resumo:

```bash
npm install
cp .env.example .env   # preencha com suas credenciais do Firebase (ver SETUP.md)
npx expo prebuild --clean
npx expo run:android   # ou npx expo run:ios
```

## Créditos

Baseado no projeto open source
[instagram-clone-app](https://github.com/hernanhawryluk/instagram-clone-app)
de Hernan Hawryluk (licença MIT), redesenhado e adaptado para a comunidade do
Inatel.
