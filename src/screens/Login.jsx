import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import LoginForm from "../components/login/LoginForm";
import Footer from "../components/login/Footer";
import { Image } from "expo-image";
import AvoidKeyboardView from "../components/shared/AvoidKeyboardView";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";

const LoginScreen = ({ navigation }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <AvoidKeyboardView
          type={Platform.OS === "ios" ? "padding" : "height"}
          start={0}
          end={220}
          style={{ flex: 1 }}
        >
          <View style={styles.mainContainer}>
            <View>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/header-logo.png")}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.tagline}>
                A rede social de alunos e ex-alunos do Inatel
              </Text>

              <LoginForm navigation={navigation} />
            </View>
          </View>
        </AvoidKeyboardView>
        <Footer navigation={navigation} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignContent: "space-between",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 16,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    height: Platform.OS === "android" ? 75 : 65,
    width: 210,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },
});
