// store/useFuelStore.ts
import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

interface Fuel {
  id: string;
  vehicleId: string;
  litres: number;
  amount: number;
  km: number;
  date: string;
  [key: string]: any; // extend if needed
}

interface FuelStore {
  fuels: Fuel[];
  selectedFuel: Fuel | null;
  isFuelsLoading: boolean;

  getFuels: () => Promise<void>;
  getFuelById: (fuelId: string) => Promise<void>;
  addFuel: (fuelData: Partial<Fuel>) => Promise<void>;
  setSelectedFuel: (fuel: Fuel | null) => void;
}

export const useFuelStore = create<FuelStore>((set, get) => ({
  fuels: [],
  selectedFuel: null,
  isFuelsLoading: false,

  getFuels: async () => {
    set({ isFuelsLoading: true });
    try {
      const res = await axiosInstance.get('/fuel');
      set({ fuels: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch fuels',
      });
    } finally {
      set({ isFuelsLoading: false });
    }
  },

  getFuelById: async (fuelId: string) => {
    try {
      const res = await axiosInstance.get(`/fuel/${fuelId}`);
      set({ selectedFuel: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch fuel',
      });
    }
  },

  addFuel: async (fuelData: Partial<Fuel>) => {
    try {
      const res = await axiosInstance.post('/fuel/new', fuelData);
      set({ fuels: [...get().fuels, res.data] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Fuel record added!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add fuel',
      });
    }
  },

  setSelectedFuel: (fuel: Fuel | null) => set({ selectedFuel: fuel }),
}));
