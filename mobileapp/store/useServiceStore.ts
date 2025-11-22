import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

type Service = {
  _id: string;
  vehicleId: string;
  service: string;
  date: string;
  nextServiceDueDate?: string;
  desc?: string;
  amount?: number;
  km?: number;
};

type ServiceStore = {
  services: Service[];
  selectedService: Service | null;
  isServicesLoading: boolean;

  getServices: () => Promise<void>;
  getServiceById: (id: string) => Promise<void>;
  addService: (serviceData: Partial<Service>, silent?: boolean) => Promise<void>;
  setSelectedService: (service: Service) => void;
};

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  selectedService: null,
  isServicesLoading: false,

  // Fetch all service records
  getServices: async () => {
    set({ isServicesLoading: true });
    try {
      const res = await axiosInstance.get('/service');
      set({ services: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch services',
      });
    } finally {
      set({ isServicesLoading: false });
    }
  },

  // Fetch a single service record by ID
  getServiceById: async (serviceId) => {
    try {
      const res = await axiosInstance.get(`/service/${serviceId}`);
      set({ selectedService: res.data });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch service',
      });
    }
  },

  // Add a new service record
  addService: async (serviceData, silent = false) => {
    try {
      const res = await axiosInstance.post('/service/new', serviceData);
      set({ services: [...get().services, res.data] });
      if (!silent) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Service record added!',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add service',
      });
    }
  },

  // Select a service
  setSelectedService: (service) => set({ selectedService: service }),
}));
