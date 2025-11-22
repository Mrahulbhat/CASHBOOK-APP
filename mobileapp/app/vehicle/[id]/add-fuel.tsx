import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Import
import Toast from 'react-native-toast-message';
import { axiosInstance } from '../../../lib/axios';
import { useFuelStore } from '../../../store/useFuelStore';

export default function AddFuelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addFuel } = useFuelStore();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [km, setKm] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/vehicle/${id}`);
        setVehicle(res.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message || 'Failed to fetch vehicle',
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
      await addFuel({
        vehicleId: id,
        date: date.toISOString(),
        amount,
        km,
        desc,
      });
      Toast.show({ type: 'success', text1: 'Fuel record added!' });
      router.push(`/vehicle/${id}/view-records`);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add fuel',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {vehicle?.image && (
            <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
          )}
          <Text style={styles.vehicleName}>{vehicle?.name}</Text>

          <Text style={styles.label}>Fuel Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Fuel Amount (Rs)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="1000"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Odometer Reading (km)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={km}
            onChangeText={setKm}
            placeholder="14000"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Description / Notes</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={desc}
            onChangeText={setDesc}
            placeholder="Filled at Indian Oil, Full tank..."
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={[styles.button, submitting && { backgroundColor: '#555' }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add Fuel Record</Text>
            )}
          </TouchableOpacity>

          <Toast />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  vehicleName: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  inputText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#f97316',
    padding: 16,
    marginTop: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
