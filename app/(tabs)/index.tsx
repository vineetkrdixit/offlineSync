import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  Button,
  Text,
  View,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "../../data/database";
import React from "react";


export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [userData, setUserData] = useState([]);

  const handleAddOrUpdate = async () => {
    if (input.trim() === "") {
      Alert.alert("Validation", "Please enter a valid name.");
      return;
    }
    let isAdult;
    if (ageInput < "18") {
      isAdult = false;
    } else {
      isAdult = true;
    }

    if (editId !== null) {
      await database.write(async () => {
        const updateData = await database.get("userdata").find(editId);
        updateData.update((user) => {
          user.username = input;
        });
      });
      setEditId(null)
    } else {
      await database.write(async () => {
        const newPost = await database.get("userdata").create((user) => {
          (user.username = input), (user.is_adult = isAdult),(user.sync_status = "pending");
        });
      });
    }
    setInput("");
    setAgeInput("");
  };

  console.log(editId,"uiiii")

  const handleEdit = (id: number, name: string) => {
    setEditId(id);
    setInput(name);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmation", "Are you sure you want to delete this item?", [
      { text: "Cancel" },
      { text: "Yes", onPress: () => deleteItem(id) },
    ]);
  };

  const deleteItem = async (id) => {
    await database.write(async () => {
      const deltedData = await database.get("userdata").find(id);
      deltedData.destroyPermanently();
    });
  };
  const getuserData = () => {
    const userData = database.collections.get("userdata");
    userData
      .query()
      .observe()
      .forEach((item) => {
        let useritem = [];
        item?.forEach((item) => {
          // console.log(item, "item in last foreach");
          useritem?.push(item?._raw);
        });
        setUserData(useritem);
        // console.log(item,"-=-=-=")
      });
    // console.log(userData);
  };

  console.log(userData, "data set ho gya h");

  useEffect(() => {
    getuserData();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 ,marginTop:10 }}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter item name"
          value={input}
          onChangeText={(e) => setInput(e)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter item Age"
          value={ageInput}
          onChangeText={(e) => setAgeInput(e)}
          keyboardType="numeric"
        />
        <Button
          title={editId !== null ? "Update Item" : "Add Item"}
          onPress={handleAddOrUpdate}
        />
        <FlatList
          data={userData}
          keyExtractor={({ item }) => item?.id?.toString()}
          renderItem={({ item }) => {
            return (
              <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{item?.username}</Text>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="Edit"
                    onPress={() => handleEdit(item?.id, item?.username)}
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDelete(item?.id)}
                    color="red"
                    disabled={editId ? true : false}
                  />
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
