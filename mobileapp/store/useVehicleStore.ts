import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

type Vehicle = {
  _id: string;
  name: string;
  image: string;
  dateOfPurchase: string;

};

type VehicleStore = {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isVehiclesLoading: boolean;

  getVehicles: () => Promise<void>;
  setSelectedVehicle: (vehicle: Vehicle) => void;
};

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  isVehiclesLoading: false,

  getVehicles: async () => {
    set({ isVehiclesLoading: true });
    try {
      const res = await axiosInstance.get('/vehicle');
      set({ vehicles: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch vehicles',
      });
    } finally {
      set({ isVehiclesLoading: false });
    }
  },

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}));
