// Configuração do login Microsoft (Entra ID) + Firebase.
// Os valores reais devem ser definidos em um arquivo .env na raiz do projeto
// (veja .env.example e SETUP.md). Variáveis EXPO_PUBLIC_* são embutidas no
// bundle pelo Expo em tempo de build.

// "Application (client) ID" do registro de aplicativo no Microsoft Entra ID.
export const AZURE_CLIENT_ID =
  process.env.EXPO_PUBLIC_AZURE_CLIENT_ID ?? "COLOQUE_SEU_CLIENT_ID_AQUI";

// ID do tenant do Inatel no Microsoft 365 (GUID). Usar o tenant fixo garante
// que somente contas da organização Inatel consigam autenticar, e que o
// issuer do token seja estável para a validação do Firebase.
export const AZURE_TENANT_ID =
  process.env.EXPO_PUBLIC_AZURE_TENANT_ID ?? "COLOQUE_O_TENANT_ID_DO_INATEL_AQUI";

// ID do provedor OpenID Connect configurado no Firebase Authentication.
export const FIREBASE_OIDC_PROVIDER_ID =
  process.env.EXPO_PUBLIC_FIREBASE_OIDC_PROVIDER_ID ?? "oidc.microsoft";

// Scheme registrado no app.json — usado no redirect URI do OAuth
// (inatelinos://auth). Deve estar cadastrado no registro do Azure.
export const AUTH_SCHEME = "inatelinos";
export const AUTH_PATH = "auth";
