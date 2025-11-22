import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useAirStore = create((set, get) => ({
  airs: [],
  selectedAir: null,
  isAirsLoading: false,

  // Fetch all air checkup records
  getAirs: async () => {
    set({ isAirsLoading: true });
    try {
      const res = await axiosInstance.get('/air');
      set({ airs: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch air records',
      });
    } finally {
      set({ isAirsLoading: false });
    }
  },

  // Fetch a single air record by ID
  getAirById: async (airId: string) => {
    try {
      const res = await axiosInstance.get(`/air/${airId}`);
      set({ selectedAir: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch air record',
      });
    }
  },

  // Add a new air checkup record
  addAir: async (airData: any) => {
    try {
      const res = await axiosInstance.post('/air/new', airData);
      set({ airs: [...get().airs, res.data] });
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Air record added!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add air record',
      });
    }
  },

  // Select an air record
  setSelectedAir: (air: any) => set({ selectedAir: air }),
}));
