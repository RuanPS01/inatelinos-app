import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import isInatelEmail from "../utils/isInatelEmail";
import useResetPassword from "../hooks/useResetPassword";
import AvoidKeyboardView from "../components/shared/AvoidKeyboardView";
import MessageModal from "../components/shared/modals/MessageModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";

const Forgot = ({ navigation }) => {
  const { value, setValue, resetPassword, loader, message } = useResetPassword({
    navigation,
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <AvoidKeyboardView
          type={Platform.OS === "ios" ? "padding" : "height"}
          start={0}
          end={200}
          style={styles.mainContainer}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={60} color="#fff" />
          </View>
          <Text style={styles.titleText}>Problemas para entrar?</Text>
          <Text style={styles.normalText}>
            Digite seu e-mail do Inatel e enviaremos um link para você voltar
            a acessar sua conta.
          </Text>
          <View style={styles.rowContainer}></View>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholderTextColor={"#bbb"}
              placeholder="E-mail do Inatel"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              onChangeText={(text) => setValue(text)}
              value={value}
            />
          </View>
          <TouchableOpacity
            onPress={() => resetPassword()}
            style={[
              styles.buttonWrapper,
              { opacity: isInatelEmail(value) ? 1 : 0.6 },
            ]}
          >
            {loader ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Avançar</Text>
            )}
          </TouchableOpacity>
        </AvoidKeyboardView>
        <View style={styles.footerContainer}>
          <View style={styles.fulDivider}></View>
          <TouchableOpacity
            style={styles.footerTextContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.footerText}>Voltar para o login</Text>
          </TouchableOpacity>
        </View>

        <MessageModal
          messageModalVisible={Boolean(message)}
          message={message?.text}
          height={70}
          icon={message?.type === "ok" ? "developer" : "wrong"}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Forgot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 100,
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  titleText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  normalText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    marginVertical: 15,
  },
  rowContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  textInputWrapper: {
    marginTop: 15,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 15,
    width: "100%",
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textInput: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    width: "95%",
  },
  buttonWrapper: {
    marginTop: 28,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    width: "100%",
    height: Platform.OS === "android" ? 56 : 54,
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 70,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  footerContainer: {
    height: Platform.OS === "android" ? 70 : 50,
    width: "100%",
  },
  fulDivider: {
    width: "100%",
    height: 0.5,
    backgroundColor: "#222",
  },
  footerTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: Platform.OS === "android" ? 70 : 50,
    paddingBottom: Platform.OS === "android" ? 5 : 0,
  },
  footerText: {
    color: COLORS.link,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
