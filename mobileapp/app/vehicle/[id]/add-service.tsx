// File: app/vehicle/[id]/add-service.tsx

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../../../lib/axios";
import { useServiceStore } from "../../../store/useServiceStore";

const { width } = Dimensions.get("window");

export default function AddServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addService } = useServiceStore();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nextServiceDate, setNextServiceDate] = useState<Date | null>(null);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [km, setKm] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/vehicle/${id}`);
        setVehicle(res.data);
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2: "Unable to load vehicle details. Please try again.",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!serviceType) newErrors.serviceType = "Please select a service type";
    if (amount && isNaN(Number(amount)))
      newErrors.amount = "Amount must be a number";
    if (km && isNaN(Number(km))) newErrors.km = "KM must be a number";
    if (nextServiceDate && nextServiceDate <= date)
      newErrors.nextServiceDate = "Must be after service date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fix the errors",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addService({
        vehicleId: id!,
        service: serviceType,
        date: date.toISOString(),
        nextServiceDueDate: nextServiceDate?.toISOString(),
        desc,
        amount: Number(amount),
        km: Number(km),
      });

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Service record added",
      });
      router.push(`/vehicle/${id}/view-records`);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Could not add record",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearNextServiceDate = () => {
    setNextServiceDate(null);
    setErrors((prev) => ({ ...prev, nextServiceDate: "" }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading vehicle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add Service</Text>

          {vehicle?.image && (
            <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          )}

          <Text style={styles.vehicleName}>{vehicle?.name}</Text>

          <Text style={styles.label}>Service Type *</Text>
          <View
            style={[
              styles.pickerContainer,
              errors.serviceType && styles.errorBorder,
            ]}
          >
            <Picker
              selectedValue={serviceType}
              onValueChange={(val) => {
                setServiceType(val);
                setErrors((prev) => ({ ...prev, serviceType: "" }));
              }}
              dropdownIconColor="#f97316"
              style={{ color: "#fff" }}
            >
              <Picker.Item label="Select service type..." value="" color="#666" />
              <Picker.Item label="🔧 General Service" value="general service" />
              <Picker.Item label="🛡️ Insurance" value="insurance" />
              <Picker.Item label="🌱 Emission" value="emission" />
            </Picker>
          </View>
          {errors.serviceType && (
            <Text style={styles.error}>{errors.serviceType}</Text>
          )}

          <Text style={styles.label}>Service Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: "#fff" }}>📅 {date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowDatePicker(false);
                d && setDate(d);
              }}
            />
          )}

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.errorBorder]}
            keyboardType="numeric"
            placeholder="5000"
            placeholderTextColor="#666"
            value={amount}
            onChangeText={(t) => {
              setAmount(t);
              setErrors((prev) => ({ ...prev, amount: "" }));
            }}
          />
          {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}

          <Text style={styles.label}>Kilometers (KM)</Text>
          <TextInput
            style={[styles.input, errors.km && styles.errorBorder]}
            keyboardType="numeric"
            placeholder="45000"
            placeholderTextColor="#666"
            value={km}
            onChangeText={(t) => {
              setKm(t);
              setErrors((prev) => ({ ...prev, km: "" }));
            }}
          />
          {errors.km && <Text style={styles.error}>{errors.km}</Text>}

          <Text style={styles.label}>Next Service Date</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={[styles.input, { flex: 1 }]}
              onPress={() => setShowNextDatePicker(true)}
            >
              <Text style={{ color: "#fff" }}>
                {nextServiceDate
                  ? `📅 ${nextServiceDate.toDateString()}`
                  : "Select date"}
              </Text>
            </TouchableOpacity>
            {nextServiceDate && (
              <TouchableOpacity
                onPress={clearNextServiceDate}
                style={styles.clearBtn}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {showNextDatePicker && (
            <DateTimePicker
              value={nextServiceDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowNextDatePicker(false);
                d && setNextServiceDate(d);
              }}
            />
          )}
          {errors.nextServiceDate && (
            <Text style={styles.error}>{errors.nextServiceDate}</Text>
          )}

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            multiline
            placeholder="Write notes..."
            placeholderTextColor="#666"
            value={desc}
            onChangeText={setDesc}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, submitting && { backgroundColor: "#555" }]}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>💾 Add Service</Text>
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
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    padding: 30,
    paddingBottom: 40,
    backgroundColor: "#0a0a0a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#1a1a1a",
  },
  vehicleName: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    color: "#ccc",
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#f97316",
    padding: 16,
    marginTop: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#ef4444",
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  errorBorder: {
    borderColor: "#ef4444",
    borderWidth: 1.5,
  },
  clearBtn: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
});
