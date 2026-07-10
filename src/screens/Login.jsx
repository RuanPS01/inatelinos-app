import { StyleSheet, Text, View, Platform } from "react-native";
import MicrosoftLogin from "../components/login/MicrosoftLogin";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Divider } from "react-native-elements";
import { COLORS } from "../constants";

const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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

          <MicrosoftLogin />
        </View>
      </View>
      <View>
        <Divider width={0.5} color="#333" />
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Acesso exclusivo com conta Microsoft do Inatel
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
    height: Platform.OS === "android" ? 80 : 70,
    width: 230,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
  },
  footerContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: Platform.OS === "android" ? 70 : 50,
    paddingBottom: Platform.OS === "android" ? 5 : 0,
  },
  footerText: {
    color: "#bbb",
    fontSize: 13,
  },
});
