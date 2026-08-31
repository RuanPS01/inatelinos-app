import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLocales } from "expo-localization";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import AvoidKeyboardView from "../components/shared/AvoidKeyboardView";
import { COLORS } from "../constants";

const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

// Sugere um nome de usuário a partir da parte local do e-mail institucional.
const suggestUsername = (email) =>
  (email?.split("@")[0] || "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ".")
    .slice(0, 30);

// Primeiro acesso: a conta Microsoft já foi validada, mas o perfil ainda não
// existe no Firestore. Aqui o inatelino escolhe o nome de usuário e o perfil
// é criado com a mesma estrutura usada pelo restante do app.
const CompleteProfile = () => {
  const user = auth.currentUser;
  const email = (user?.email || "").toLowerCase();

  const [username, setUsername] = useState(suggestUsername(email));
  const [name, setName] = useState(user?.displayName || "");
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const usernameIsValid = useMemo(
    () => USERNAME_REGEX.test(username),
    [username]
  );

  const createProfile = async () => {
    if (!usernameIsValid || !email) return;
    Keyboard.dismiss();
    try {
      setLoader(true);
      const displayName = name.trim() || username;
      const avatarUrl =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(displayName) +
        "&background=1E60AD&color=fff&size=256";

      await setDoc(doc(db, "users", email), {
        owner_uid: user.uid,
        username: username,
        email: email,
        profile_picture: avatarUrl,
        name: displayName,
        bio: "",
        link: "",
        gender: ["Prefer not to say", ""],
        followers: [],
        following: [],
        followers_request: [],
        following_request: [],
        event_notification: 0,
        chat_notification: 0,
        saved_posts: [],
        close_friends: [],
        favorite_users: [],
        muted_users: [],
        createdAt: serverTimestamp(),
        country: getLocales()[0]?.regionCode || "BR",
      });
      // O onSnapshot do AuthNavigation detecta o novo perfil e troca de tela.
    } catch (error) {
      console.log("Erro ao criar perfil:", error);
      setErrorMessage("Não foi possível criar seu perfil. Tente novamente.");
      setLoader(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <AvoidKeyboardView
          type={Platform.OS === "ios" ? "padding" : "height"}
          start={0}
          end={180}
          style={{ flex: 1 }}
        >
          <View style={styles.mainContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/header-logo.png")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.title}>Bem-vindo(a), inatelino(a)!</Text>

            <View style={styles.emailBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.link} />
              <Text style={styles.emailText}>{email}</Text>
            </View>

            <Text style={styles.label}>Nome de usuário</Text>
            <View
              style={[
                styles.inputField,
                {
                  borderColor:
                    username.length > 0 && !usernameIsValid
                      ? "#f00"
                      : "#444",
                },
              ]}
            >
              <TextInput
                style={styles.inputText}
                placeholderTextColor={"#bbb"}
                placeholder="nome.de.usuario"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase())}
              />
            </View>
            <Text style={styles.hint}>
              Letras minúsculas, números, ponto e underline (3 a 30 caracteres).
            </Text>

            <Text style={styles.label}>Nome exibido</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.inputText}
                placeholderTextColor={"#bbb"}
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
              />
            </View>

            <TouchableOpacity
              onPress={createProfile}
              disabled={!usernameIsValid || loader}
            >
              <View
                style={[
                  styles.btnContainer,
                  { opacity: usernameIsValid && !loader ? 1 : 0.6 },
                ]}
              >
                {loader ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Criar meu perfil</Text>
                )}
              </View>
            </TouchableOpacity>

            {Boolean(errorMessage) && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={styles.signOutContainer}
              onPress={() => signOut(auth)}
            >
              <Text style={styles.signOutText}>
                Entrar com outra conta? Sair
              </Text>
            </TouchableOpacity>
          </View>
        </AvoidKeyboardView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CompleteProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    height: 60,
    width: 180,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },
  emailBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  emailText: {
    color: COLORS.link,
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 2,
  },
  inputField: {
    marginTop: 6,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 15,
    height: 52,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  hint: {
    color: "#777",
    fontSize: 12,
    marginTop: 6,
  },
  btnContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    color: "#f66",
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
  },
  signOutContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  signOutText: {
    color: COLORS.link,
    fontSize: 13,
    fontWeight: "700",
  },
});
