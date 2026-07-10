import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import MessageModal from "../components/shared/modals/MessageModal";
import { COLORS } from "../constants";

const RESEND_COOLDOWN = 30; // segundos

// Bloqueia o acesso até o link de confirmação enviado ao e-mail do Inatel
// ser aberto — garante que o usuário realmente tem acesso à caixa de entrada.
const VerifyEmail = ({ onVerified }) => {
  const email = auth.currentUser?.email || "";
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [message, setMessage] = useState(null); // { text, type: "ok" | "error" }
  const pollRef = useRef(null);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // Confere na conta se o e-mail já foi confirmado. Quando sim, força a
  // renovação do ID token para que o Firestore enxergue email_verified=true.
  const checkVerified = async (silent = true) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      if (!silent) setChecking(true);
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        await auth.currentUser.getIdToken(true);
        onVerified();
        return;
      }
      if (!silent) {
        showMessage(
          "Ainda não confirmado. Abra o link enviado ao seu e-mail.",
          "error"
        );
      }
    } catch (error) {
      console.log("Erro ao verificar confirmação:", error.code);
    } finally {
      if (!silent) setChecking(false);
    }
  };

  // Checagem automática a cada 5 segundos.
  useEffect(() => {
    pollRef.current = setInterval(() => checkVerified(true), 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Contador do reenvio.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (cooldown > 0 || !auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      showMessage("E-mail de confirmação reenviado!", "ok");
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      console.log(error.code);
      if (error.code === "auth/too-many-requests") {
        showMessage("Muitos envios. Aguarde alguns minutos.", "error");
        setCooldown(120);
      } else {
        showMessage("Não foi possível reenviar. Tente novamente.", "error");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.mainContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/header-logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread-outline" size={54} color="#fff" />
        </View>

        <Text style={styles.title}>Confirme seu e-mail</Text>
        <Text style={styles.emailText}>{email}</Text>
        <Text style={styles.normalText}>
          Enviamos um link de confirmação para a sua caixa de entrada do
          Inatel. Abra o e-mail e toque no link para ativar sua conta.
        </Text>
        <Text style={styles.hintText}>
          Não chegou? Verifique a pasta de spam/lixo eletrônico.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => checkVerified(false)}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Já confirmei</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { opacity: cooldown > 0 ? 0.5 : 1 }]}
          onPress={resend}
          disabled={cooldown > 0}
        >
          <Text style={styles.secondaryButtonText}>
            {cooldown > 0
              ? `Reenviar e-mail (${cooldown}s)`
              : "Reenviar e-mail"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutContainer}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.signOutText}>E-mail errado? Sair</Text>
        </TouchableOpacity>
      </View>

      <MessageModal
        messageModalVisible={Boolean(message)}
        message={message?.text}
        height={70}
        icon={message?.type === "ok" ? "developer" : "wrong"}
      />
    </SafeAreaView>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 26,
  },
  logo: {
    height: 55,
    width: 165,
  },
  iconContainer: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 100,
    height: 96,
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  emailText: {
    color: COLORS.link,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  normalText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 19,
  },
  hintText: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    width: "100%",
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.accent,
    width: "100%",
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: COLORS.link,
    fontSize: 15,
    fontWeight: "700",
  },
  signOutContainer: {
    marginTop: 26,
  },
  signOutText: {
    color: COLORS.link,
    fontSize: 13,
    fontWeight: "700",
  },
});
