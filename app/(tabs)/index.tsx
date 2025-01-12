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
import NetInfo from "@react-native-community/netinfo";
import { syncDatabase } from "../../data/syncService";

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [userData, setUserData] = useState([]);


  function getFormattedCurrentDate() {
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset(); // Timezone offset in minutes

    // Format the offset as +HH:mm or -HH:mm
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const formattedOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

    // Combine ISO string with the offset
    const isoString = now.toISOString(); // 2025-01-07T18:30:37.893Z
    const formattedDate = isoString.replace('Z', formattedOffset); // 2025-01-07T18:30:37.893+00:00

    return formattedDate;
}

console.log(getFormattedCurrentDate(),"getFormattedCurrentDate=--=-=-")

  const handleAddOrUpdate = async () => {
    if (input.trim() === "") {
      Alert.alert("Validation", "Please enter a valid name.");
      return;
    }

    try {
      if (editId !== null) {
    
        await database.write(async () => {
          const updateData = await database.get("userdata").find(editId);
          updateData.update((user) => {
            user.username = input;
            user.age = Number(ageInput);
            user.updatedAt=getFormattedCurrentDate()
          });
        });
        setEditId(null);
      } else {
      
        await database.write(async () => {
          await database.get("userdata").create((user) => {
            user.username = input;
            user.age = Number(ageInput);
            user.deleted = false;
            user.createdAt= getFormattedCurrentDate()
          });
        });
      }
    } catch (error) {
      console.error("Database operation failed:", error);
    }

    setInput("");
    setAgeInput("");
  };

  const handleEdit = (id: number, name: string, age: any) => {
    setEditId(id);
    setInput(name);
    setAgeInput(age?.toString() || "");
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
      deltedData.markAsDeleted();
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
          useritem?.push(item?._raw);
        });
        setUserData(useritem);
      });
  };

  console.log(userData,"userData")
  const clear=async()=>{
    await database.action(async () => {
      await database.unsafeResetDatabase();  // This will clear the DB
  });
  }

  useEffect(() => {
    getuserData();
  }, []);
 useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncDatabase(); // Sync only if connected
      } else {
        console.log('No internet connection. Sync skipped.');
      }
    });

    return () => unsubscribeNetInfo(); // Cleanup listener
  }, []); //

  return (
    <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
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
          // keyboardType="numeric"
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
                <Text style={styles.itemText}>{item?.age}</Text>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="Edit"
                    onPress={() =>
                      handleEdit(item?.id, item?.username, item?.age)
                    }
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
