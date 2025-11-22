import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ added SafeAreaView
import Toast from "react-native-toast-message";
import { axiosInstance } from "../../../lib/axios";
import { useAirStore } from "../../../store/useAirStore";

export default function AddAirScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [km, setKm] = useState("");
  const [type, setType] = useState("Normal air");

  const { addAir } = useAirStore();

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/vehicle/${id}`);
        setVehicle(res.data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to load vehicle",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addAir({
        vehicleId: id!,
        date: date.toISOString(),
        km,
        type,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Air checkup added",
      });
      router.push(`/vehicle/${id}/view-records`);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add air record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading vehicle...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {vehicle?.image && (
            <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          )}
          <Text style={styles.vehicleName}>{vehicle?.name}</Text>

          <Text style={styles.label}>Checkup Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: "white" }}>📅 {date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                selectedDate && setDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Odometer Reading (KM)</Text>
          <TextInput
            style={styles.input}
            placeholder="14000"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={km}
            onChangeText={setKm}
          />

          <Text style={styles.label}>Air Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(val) => setType(val)}
              dropdownIconColor="#f97316"
              style={{ color: "#fff" }}
            >
              <Picker.Item label="Normal Air" value="Normal air" />
              <Picker.Item label="Nitrogen" value="Nitrogen" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>💨 Add Air Record</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  container: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 16,
  },
  vehicleName: {
    textAlign: "center",
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },
  label: {
    color: "#ccc",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 12,
    borderRadius: 8,
  },
  pickerContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  button: {
    marginTop: 30,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f97316",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
