import { useState } from "react";
import { Keyboard } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import isInatelEmail from "../utils/isInatelEmail";

const useResetPassword = ({ navigation }) => {
  const [value, setValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState(null); // { text, type: "ok" | "error" }

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const resetPassword = async () => {
    Keyboard.dismiss();
    const email = value.trim().toLowerCase();
    if (!isInatelEmail(email)) {
      showMessage(
        "Use seu e-mail do Inatel (@inatel.br ou @sigla.inatel.br).",
        "error"
      );
      return;
    }
    try {
      setLoader(true);
      await sendPasswordResetEmail(auth, email);
      showMessage("Link de redefinição enviado! Confira seu e-mail.", "ok");
      setTimeout(() => navigation.goBack(), 3500);
    } catch (error) {
      console.log(error.code);
      if (error.code === "auth/user-not-found") {
        showMessage("Não existe conta com este e-mail.", "error");
      } else if (error.code === "auth/too-many-requests") {
        showMessage("Muitas tentativas. Aguarde e tente novamente.", "error");
      } else {
        showMessage("Não foi possível enviar o e-mail. Tente de novo.", "error");
      }
    } finally {
      setLoader(false);
    }
  };

  return { value, setValue, resetPassword, loader, message };
};

export default useResetPassword;
