import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import SignedOutStack from "./SignedOutStack";
import SignedInStack from "./SignedInStack";
import CompleteProfile from "../screens/CompleteProfile";
import VerifyEmail from "../screens/VerifyEmail";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import isInatelEmail from "../utils/isInatelEmail";

const AuthNavigation = () => {
  // undefined = ainda verificando; null = deslogado
  const [currentUser, setCurrentUser] = useState(undefined);
  const [profile, setProfile] = useState({ checked: false, exists: false });
  // Incrementado quando o VerifyEmail detecta a confirmação (o objeto de
  // usuário é atualizado in-place pelo reload, então forçamos o re-render).
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Barreira de domínio: qualquer sessão fora do Inatel é encerrada.
      if (user && !isInatelEmail(user.email)) {
        signOut(auth);
        return;
      }
      setCurrentUser(user ?? null);
    });
    return unsubscribe;
  }, []);

  const emailVerified = Boolean(currentUser?.emailVerified);

  // Com sessão ativa e e-mail confirmado, observa o documento do perfil:
  // se ainda não existir, direciona para a criação do perfil.
  useEffect(() => {
    if (!currentUser?.email || !emailVerified) {
      setProfile({ checked: false, exists: false });
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.email.toLowerCase()),
      (snapshot) => setProfile({ checked: true, exists: snapshot.exists() })
    );
    return unsubscribe;
  }, [currentUser?.email, emailVerified, refreshTick]);

  let content = null;
  if (currentUser === null) {
    content = <SignedOutStack />;
  } else if (currentUser && !emailVerified) {
    content = <VerifyEmail onVerified={() => setRefreshTick((t) => t + 1)} />;
  } else if (currentUser && profile.checked) {
    content = profile.exists ? <SignedInStack /> : <CompleteProfile />;
  }

  return <View style={styles.container}>{content}</View>;
};

export default AuthNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
