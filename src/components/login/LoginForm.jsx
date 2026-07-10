import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import MessageModal from "../shared/modals/MessageModal";
import { auth } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import isInatelEmail from "../../utils/isInatelEmail";
import { COLORS } from "../../constants";

const LoginFormSchema = Yup.object().shape({
  email: Yup.string()
    .required()
    .test("inatel", "E-mail fora do domínio Inatel", isInatelEmail),
  password: Yup.string().required().min(6),
});

const LoginForm = ({ navigation }) => {
  const [obsecureText, setObsecureText] = useState(true);
  const [emailOnFocus, setEmailOnFocus] = useState(false);
  const [emailToValidate, setEmailToValidate] = useState(false);
  const [passwordToValidate, setPasswordToValidate] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const handleDataError = (message) => {
    setErrorMessage(message);
    setMessageModalVisible(true);
    setTimeout(() => {
      setMessageModalVisible(false);
    }, 3500);
  };

  const onLogin = async (email, password) => {
    Keyboard.dismiss();
    const cleanEmail = email.trim().toLowerCase();
    if (!isInatelEmail(cleanEmail)) {
      handleDataError(
        "Use seu e-mail do Inatel (@inatel.br ou @sigla.inatel.br)."
      );
      return;
    }
    try {
      setLoader(true);
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      // O AuthNavigation assume a partir daqui (verificação de e-mail e perfil).
    } catch (error) {
      console.log(error.code);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        handleDataError("E-mail ou senha incorretos. Tente novamente.");
      } else if (error.code === "auth/too-many-requests") {
        handleDataError("Muitas tentativas. Aguarde um pouco e tente de novo.");
      } else {
        handleDataError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={(values) => {
          onLogin(values.email, values.password);
        }}
        validationSchema={LoginFormSchema}
        validateOnMount={true}
      >
        {({ handleChange, handleBlur, handleSubmit, values, isValid }) => (
          <View>
            <View
              style={[
                styles.inputField,
                {
                  borderColor:
                    emailToValidate && !isInatelEmail(values.email)
                      ? "#f00"
                      : "#444",
                },
              ]}
            >
              <TextInput
                style={styles.inputText}
                placeholderTextColor={"#bbb"}
                placeholder="E-mail do Inatel"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                onChangeText={handleChange("email")}
                onBlur={() => {
                  handleBlur("email");
                  setEmailOnFocus(false);
                  setEmailToValidate(values.email.length > 0);
                }}
                onFocus={() => setEmailOnFocus(true)}
                value={values.email}
              />
              <TouchableOpacity onPress={() => handleChange("email")("")}>
                <Octicons
                  name={emailOnFocus ? "x-circle-fill" : ""}
                  size={15}
                  color={"#555"}
                />
              </TouchableOpacity>
            </View>
            {emailToValidate &&
              values.email.length > 0 &&
              !isInatelEmail(values.email) && (
                <Text style={styles.fieldError}>
                  Somente e-mails @inatel.br ou @sigla.inatel.br
                </Text>
              )}

            <View
              style={[
                styles.inputField,
                {
                  borderColor:
                    passwordToValidate && values.password.length < 6
                      ? "#f00"
                      : "#444",
                },
              ]}
            >
              <TextInput
                style={styles.inputText}
                placeholderTextColor={"#bbb"}
                placeholder="Senha"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={obsecureText}
                textContentType="password"
                onChangeText={handleChange("password")}
                onBlur={() => {
                  handleBlur("password");
                  setPasswordToValidate(values.password.length > 0);
                }}
                value={values.password}
              />
              <TouchableOpacity onPress={() => setObsecureText(!obsecureText)}>
                <MaterialCommunityIcons
                  name={obsecureText ? "eye-off" : "eye"}
                  size={24}
                  color={obsecureText ? "#fff" : COLORS.accent}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.forgotContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSubmit} disabled={!isValid}>
              <View style={styles.btnContainer(isValid)}>
                {loader ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Entrar</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <MessageModal
        messageModalVisible={messageModalVisible}
        message={errorMessage}
        height={70}
        icon="wrong"
      />
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  inputField: {
    marginTop: 14,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingLeft: 15,
    paddingRight: 25,
    marginHorizontal: 20,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    width: "95%",
  },
  fieldError: {
    color: "#f66",
    fontSize: 12,
    marginTop: 6,
    marginHorizontal: 24,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 20,
    marginRight: 20,
  },
  forgotText: {
    color: COLORS.link,
    fontWeight: "700",
  },
  btnContainer: (isValid) => ({
    marginTop: 35,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    opacity: isValid ? 1 : 0.6,
    marginHorizontal: 20,
    justifyContent: "center",
    alignContent: "center",
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  }),
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
