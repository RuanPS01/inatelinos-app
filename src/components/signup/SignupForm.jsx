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
import { MaterialCommunityIcons, Octicons, Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import MessageModal from "../shared/modals/MessageModal";
import { auth } from "../../services/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import isInatelEmail from "../../utils/isInatelEmail";
import { COLORS } from "../../constants";

const SignupFormSchema = Yup.object().shape({
  email: Yup.string()
    .required()
    .test("inatel", "E-mail fora do domínio Inatel", isInatelEmail),
  password: Yup.string().required().min(6),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password")], "As senhas não coincidem"),
});

// Cria a conta com o e-mail institucional e dispara o link de confirmação.
// O nome de usuário é escolhido depois da verificação (tela de primeiro
// acesso), pois as regras do Firestore só permitem criar o perfil com o
// e-mail já confirmado.
const SignupForm = () => {
  const [obsecureText, setObsecureText] = useState(true);
  const [emailOnFocus, setEmailOnFocus] = useState(false);
  const [emailToValidate, setEmailToValidate] = useState(false);
  const [passwordToValidate, setPasswordToValidate] = useState(false);
  const [confirmToValidate, setConfirmToValidate] = useState(false);
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

  const onSignup = async (email, password) => {
    Keyboard.dismiss();
    const cleanEmail = email.trim().toLowerCase();
    if (!isInatelEmail(cleanEmail)) {
      handleDataError(
        "O Inatelinos é exclusivo para e-mails @inatel.br ou @sigla.inatel.br."
      );
      return;
    }
    try {
      setLoader(true);
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );
      await sendEmailVerification(userCredentials.user);
      // O AuthNavigation direciona para a tela de confirmação de e-mail.
    } catch (error) {
      console.log(error.code);
      if (error.code === "auth/email-already-in-use") {
        handleDataError("Este e-mail já possui uma conta. Faça login.");
      } else if (error.code === "auth/weak-password") {
        handleDataError("Senha fraca: use pelo menos 6 caracteres.");
      } else if (error.code === "auth/invalid-email") {
        handleDataError("E-mail inválido. Verifique o que foi digitado.");
      } else {
        handleDataError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        onSubmit={(values) => {
          onSignup(values.email, values.password);
        }}
        validationSchema={SignupFormSchema}
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
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
                placeholder="Senha (mínimo 6 caracteres)"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={obsecureText}
                textContentType="newPassword"
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

            <View
              style={[
                styles.inputField,
                {
                  borderColor:
                    confirmToValidate &&
                    values.confirmPassword !== values.password
                      ? "#f00"
                      : "#444",
                },
              ]}
            >
              <TextInput
                style={styles.inputText}
                placeholderTextColor={"#bbb"}
                placeholder="Confirmar senha"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={obsecureText}
                textContentType="newPassword"
                onChangeText={handleChange("confirmPassword")}
                onBlur={() => {
                  handleBlur("confirmPassword");
                  setConfirmToValidate(values.confirmPassword.length > 0);
                }}
                value={values.confirmPassword}
              />
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="mail-unread-outline" size={16} color={COLORS.link} />
              <Text style={styles.infoText}>
                Enviaremos um link de confirmação para o seu e-mail do Inatel.
                A conta só é liberada após a confirmação.
              </Text>
            </View>

            <TouchableOpacity onPress={handleSubmit} disabled={!isValid}>
              <View style={styles.btnContainer(isValid)}>
                {loader ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Criar conta</Text>
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

export default SignupForm;

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
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginHorizontal: 24,
  },
  infoText: {
    flex: 1,
    color: "#bbb",
    fontSize: 12,
    lineHeight: 17,
  },
  btnContainer: (isValid) => ({
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    opacity: isValid ? 1 : 0.6,
    marginHorizontal: 20,
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  }),
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
