import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  exchangeCodeAsync,
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { OAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  AUTH_PATH,
  AUTH_SCHEME,
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  FIREBASE_OIDC_PROVIDER_ID,
} from "../services/authConfig";
import isInatelEmail from "../utils/isInatelEmail";
import decodeJwt from "../utils/decodeJwt";

WebBrowser.maybeCompleteAuthSession();

// Endpoints do Microsoft identity platform fixados no tenant do Inatel:
// somente contas dessa organização conseguem concluir o login.
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
};

const redirectUri = makeRedirectUri({ scheme: AUTH_SCHEME, path: AUTH_PATH });

// Fluxo completo: OAuth 2.0 (code + PKCE) na Microsoft → validação do domínio
// do e-mail → confirmação do usuário → signInWithCredential no Firebase via
// provedor OIDC. O nonce enviado à Microsoft é o SHA-256 do rawNonce, que o
// Firebase confere ao validar o ID token.
const useMicrosoftAuth = () => {
  const [nonce, setNonce] = useState(null); // { raw, hashed }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingAccount, setPendingAccount] = useState(null); // aguardando confirmação

  const regenerateNonce = async () => {
    const raw = Crypto.randomUUID() + Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      raw
    );
    setNonce({ raw, hashed });
  };

  useEffect(() => {
    regenerateNonce();
  }, []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: AZURE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
      extraParams: {
        prompt: "select_account",
        ...(nonce ? { nonce: nonce.hashed } : {}),
      },
    },
    discovery
  );

  useEffect(() => {
    if (!response) return;
    if (response.type === "success") {
      handleAuthorizationCode(response.params.code);
    } else if (response.type === "error") {
      setError(
        response.params?.error_description ||
          "Não foi possível entrar com a Microsoft. Tente novamente."
      );
      regenerateNonce();
    }
  }, [response]);

  const handleAuthorizationCode = async (code) => {
    try {
      setLoading(true);
      const tokens = await exchangeCodeAsync(
        {
          clientId: AZURE_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        discovery
      );

      const claims = decodeJwt(tokens.idToken);
      const email = (claims.email || claims.preferred_username || "")
        .trim()
        .toLowerCase();

      if (!isInatelEmail(email)) {
        setError(
          "O Inatelinos é exclusivo para contas do Inatel. " +
            "Entre com um e-mail @inatel.br ou @sigla.inatel.br."
        );
        regenerateNonce();
        return;
      }

      // Conta validada na Microsoft — aguarda a confirmação do usuário.
      setPendingAccount({
        email,
        name: claims.name || "",
        idToken: tokens.idToken,
        rawNonce: nonce.raw,
      });
    } catch (err) {
      console.log("Erro na troca do código de autorização:", err);
      setError("Falha ao validar sua conta Microsoft. Tente novamente.");
      regenerateNonce();
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoft = async () => {
    setError(null);
    if (AZURE_CLIENT_ID.startsWith("COLOQUE")) {
      setError(
        "Login Microsoft não configurado: defina EXPO_PUBLIC_AZURE_CLIENT_ID " +
          "e EXPO_PUBLIC_AZURE_TENANT_ID no arquivo .env (veja SETUP.md)."
      );
      return;
    }
    await promptAsync();
  };

  // Chamado quando o usuário confirma o e-mail detectado.
  const confirmSignIn = async () => {
    if (!pendingAccount) return;
    try {
      setLoading(true);
      const provider = new OAuthProvider(FIREBASE_OIDC_PROVIDER_ID);
      const credential = provider.credential({
        idToken: pendingAccount.idToken,
        rawNonce: pendingAccount.rawNonce,
      });
      const result = await signInWithCredential(auth, credential);

      // Defesa extra: se por qualquer motivo o Firebase autenticar um e-mail
      // fora do domínio Inatel, desfaz o login imediatamente.
      const signedEmail = (result.user.email || pendingAccount.email).toLowerCase();
      if (!isInatelEmail(signedEmail)) {
        await signOut(auth);
        setError("Conta fora do domínio Inatel. Acesso não permitido.");
        return;
      }
      setPendingAccount(null);
    } catch (err) {
      console.log("Erro no signInWithCredential:", err.code, err.message);
      if (err.code === "auth/operation-not-allowed") {
        setError(
          "O provedor OIDC ainda não foi habilitado no Firebase. " +
            "Siga o passo 'Firebase Authentication' do SETUP.md."
        );
      } else if (err.code === "auth/invalid-credential") {
        setError(
          "O Firebase rejeitou o token da Microsoft. Confira o Issuer e o " +
            "Client ID do provedor OIDC no Firebase (SETUP.md)."
        );
      } else {
        setError("Não foi possível concluir o login. Tente novamente.");
      }
      setPendingAccount(null);
      regenerateNonce();
    } finally {
      setLoading(false);
    }
  };

  // Chamado quando o usuário rejeita a conta detectada.
  const cancelSignIn = () => {
    setPendingAccount(null);
    regenerateNonce();
  };

  return {
    signInWithMicrosoft,
    confirmSignIn,
    cancelSignIn,
    pendingAccount,
    loading,
    error,
    clearError: () => setError(null),
    ready: Boolean(request && nonce),
  };
};

export default useMicrosoftAuth;
