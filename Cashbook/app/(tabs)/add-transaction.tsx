import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { transactionApi, categoryApi, Category, CreateTransactionData } from '../../lib/api';
import { format } from 'date-fns';

export default function AddTransaction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<CreateTransactionData>({
    type: 'expense',
    amount: 0,
    description: '',
    transactionDate: new Date().toISOString(),
    paymentMode: 'bank',
    category: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryApi.getCategories();
      // Filter categories by type matching transaction type
      const filtered = data.filter((cat) => cat.type === formData.type);
      setCategories(filtered);
      if (filtered.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: filtered[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load categories',
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [formData.type, formData.category]);

  // Fetch categories when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  // Also fetch when transaction type changes
  useEffect(() => {
    fetchCategories();
  }, [formData.type]);

  const handleSubmit = async () => {
    if (!formData.category || formData.amount <= 0) {
      Alert.alert('Validation Error', 'Please select a category and enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await transactionApi.createTransaction({
        ...formData,
        amount: Number(formData.amount),
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Transaction added successfully',
      });
      // Reset form
      setFormData({
        type: 'expense',
        amount: 0,
        description: '',
        transactionDate: new Date().toISOString(),
        paymentMode: 'bank',
        category: categories[0]?._id || '',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add transaction',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Transaction</Text>

        {/* Transaction Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeContainer}>
            {(['expense', 'income', 'investment'] as const).map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, type, category: '' }))}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={formData.amount.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text) || 0;
              setFormData((prev) => ({ ...prev, amount: num }));
            }}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor="#888"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          {loadingCategories ? (
            <ActivityIndicator size="small" color="#60A5FA" />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat._id}
                    label={cat.name}
                    value={cat._id}
                    color="#fff"
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Add a note..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {format(new Date(formData.transactionDate), 'MMM dd, yyyy')}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.transactionDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                }
                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    transactionDate: selectedDate.toISOString(),
                  }));
                  if (Platform.OS === 'ios') {
                    setShowDatePicker(false);
                  }
                }
              }}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <Pressable
              style={styles.datePickerDoneButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.datePickerDoneText}>Done</Text>
            </Pressable>
          )}
        </View>

        {/* Payment Mode */}
        <View style={styles.section}>
          <Text style={styles.label}>Payment Mode</Text>
          <View style={styles.typeContainer}>
            {(['cash', 'bank'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.typeButton,
                  formData.paymentMode === mode && styles.typeButtonActive,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, paymentMode: mode }))}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.paymentMode === mode && styles.typeButtonTextActive,
                  ]}
                >
                  {mode === 'cash' ? '💵 Cash' : '🏦 Bank'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Transaction</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#60A5FA',
  },
  typeButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: '#1E1E1E',
  },
  dateButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  datePickerDoneButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

