import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState } from "react";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import useUploadComment from "../../../hooks/useUploadComment";

const FooterTextInput = ({ post, currentUser }) => {
  const [value, setValue] = useState("");
  const { uploadComment, isLoading } = useUploadComment(post, currentUser);

  const handleSubmitComment = async (value) => {
    await uploadComment(value);
    setValue("");
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.divider} />
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "❤️");
          }}
        >
          <Text style={styles.chatIcon}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "🙌");
          }}
        >
          <Text style={styles.chatIcon}>🙌</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "🔥");
          }}
        >
          <Text style={styles.chatIcon}>🔥</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "👏");
          }}
        >
          <Text style={styles.chatIcon}>👏</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "😢");
          }}
        >
          <Text style={styles.chatIcon}>😢</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "😍");
          }}
        >
          <Text style={styles.chatIcon}>😍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "😮");
          }}
        >
          <Text style={styles.chatIcon}>😮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setValue(value + "😂");
          }}
        >
          <Text style={styles.chatIcon}>😂</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.writingContainer}>
        <Image
          source={{
            uri: currentUser.profile_picture,
          }}
          style={styles.profilePicture}
        />
        <View style={styles.inputWrapper}>
          <BottomSheetTextInput
            placeholder={`Add a comment...`}
            placeholderTextColor={"#858585"}
            style={styles.textInput}
            defaultValue={value}
            onChangeText={(text) => setValue(text)}
            autoCapitalize="sentences"
            autoCorrect={true}
            maxLength={255}
            multiline
          />
          {!isLoading ? (
            <TouchableOpacity
              onPress={() => value !== "" && handleSubmitComment(value)}
            >
              <Text style={styles.postBtn}>{value !== "" && "Post"}</Text>
            </TouchableOpacity>
          ) : (
            <ActivityIndicator style={styles.activityIndicator} />
          )}
        </View>
      </View>
    </View>
  );
};

export default FooterTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#232325",
  },
  iconContainer: {
    gap: 1,
    marginLeft: -4,
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatIcon: {
    fontSize: 29,
  },
  writingContainer: {
    flexDirection: "row",
    gap: 15,
  },
  profilePicture: {
    height: 45,
    width: 45,
    borderRadius: 50,
    marginTop: Platform.OS === "ios" ? 2 : 5,
  },
  inputWrapper: {
    width: 295,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#777",
    alignItems: "center",
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 8 : 2,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    flex: 1,
    fontWeight: "400",
    color: "#fff",
    maxWidth: "78%",
    marginBottom: 5,
  },
  postBtn: {
    color: "#4581C4",
    fontSize: 18,
    fontWeight: "700",
    paddingRight: 12,
  },
  activityIndicator: {
    marginRight: 20,
  },
});
