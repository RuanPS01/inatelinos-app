import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import useMicrosoftAuth from "../../hooks/useMicrosoftAuth";
import MessageModal from "../shared/modals/MessageModal";
import { COLORS } from "../../constants";

// Logotipo da Microsoft (quatro quadrados) desenhado com Views.
const MicrosoftLogo = ({ size = 20 }) => {
  const s = (size - 2) / 2;
  return (
    <View style={{ width: size, height: size, flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
      <View style={{ width: s, height: s, backgroundColor: "#F25022" }} />
      <View style={{ width: s, height: s, backgroundColor: "#7FBA00" }} />
      <View style={{ width: s, height: s, backgroundColor: "#00A4EF" }} />
      <View style={{ width: s, height: s, backgroundColor: "#FFB900" }} />
    </View>
  );
};

const MicrosoftLogin = () => {
  const {
    signInWithMicrosoft,
    confirmSignIn,
    cancelSignIn,
    pendingAccount,
    loading,
    error,
    clearError,
    ready,
  } = useMicrosoftAuth();

  // O Modal do MessageModal bloqueia toques enquanto visível,
  // então o erro é dispensado automaticamente.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.msButton, { opacity: ready && !loading ? 1 : 0.6 }]}
        onPress={signInWithMicrosoft}
        disabled={!ready || loading}
      >
        {loading && !pendingAccount ? (
          <ActivityIndicator color="#222" />
        ) : (
          <>
            <MicrosoftLogo />
            <Text style={styles.msButtonText}>Entrar com a Microsoft</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Ionicons name="school-outline" size={16} color={COLORS.link} />
        <Text style={styles.infoText}>
          Use seu e-mail institucional do Inatel{"\n"}(@inatel.br ou
          @sigla.inatel.br)
        </Text>
      </View>

      {/* Confirmação da conta detectada */}
      <Modal
        visible={Boolean(pendingAccount)}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSignIn}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={38} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Conta Inatel verificada!</Text>
            <Text style={styles.cardEmail}>{pendingAccount?.email}</Text>
            {Boolean(pendingAccount?.name) && (
              <Text style={styles.cardName}>{pendingAccount?.name}</Text>
            )}
            <Text style={styles.cardText}>
              Confirme para entrar no Inatelinos com esta conta.
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar e entrar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelSignIn} disabled={loading}>
              <Text style={styles.cancelText}>Usar outra conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MessageModal
        messageModalVisible={Boolean(error)}
        message={error}
        height={70}
        icon="wrong"
      />
    </View>
  );
};

export default MicrosoftLogin;

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  msButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    height: 56,
    borderRadius: 10,
  },
  msButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 310,
    backgroundColor: "#1b1b1d",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  checkCircle: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  cardEmail: {
    color: COLORS.link,
    fontSize: 15,
    fontWeight: "700",
  },
  cardName: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelText: {
    color: COLORS.link,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
  },
});
