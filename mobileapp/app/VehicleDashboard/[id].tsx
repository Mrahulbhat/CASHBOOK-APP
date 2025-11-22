import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Droplets,
    History,
    Wind,
    Wrench
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { axiosInstance } from '../../lib/axios';
import { useVehicleStore } from '../../store/useVehicleStore';

const VehicleDashboard = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedVehicle, setSelectedVehicle } = useVehicleStore();

  const [vehicle, setVehicle] = useState(selectedVehicle);
  const [loading, setLoading] = useState(true);

  const [lastService, setLastService] = useState(null);
  const [lastFuel, setLastFuel] = useState(null);
  const [lastAir, setLastAir] = useState(null);

  useEffect(() => {
    if (!selectedVehicle || selectedVehicle._id !== id) {
      fetchVehicle();
    } else {
      setLoading(false);
    }
    fetchLastRecords();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await axiosInstance.get(`/vehicle/${id}`);
      setVehicle(res.data);
      setSelectedVehicle(res.data);
    } catch (error) {
      console.error('Failed to fetch vehicle', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastRecords = async () => {
    try {
      const [services, fuels, airs] = await Promise.all([
        axiosInstance.get(`/service/vehicle/${id}`),
        axiosInstance.get(`/fuel/vehicle/${id}`),
        axiosInstance.get(`/air/vehicle/${id}`)
      ]);

      const getLast = (arr: any) =>
        arr?.data?.length > 0
          ? arr.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : null;

      setLastService(getLast(services));
      setLastFuel(getLast(fuels));
      setLastAir(getLast(airs));
    } catch (error) {
      console.error('Error fetching records', error);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

  const getTimeSince = (date: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}m ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const getStatusColor = (date: string, type: string) => {
    if (!date) return '#64748b';

    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const thresholds = {
      service: { good: 90, warning: 180 },
      fuel: { good: 7, warning: 14 },
      air: { good: 30, warning: 60 }
    };

    const threshold = thresholds[type] || thresholds.service;

    if (days <= threshold.good) return '#10b981';
    if (days <= threshold.warning) return '#f59e0b';
    return '#ef4444';
  };

  const StatusCard = ({ title, date, icon, type }: any) => {
    const color = getStatusColor(date, type);

    return (
      <View
        style={[styles.statusCard, { borderColor: color, borderLeftWidth: 4 }]}
      >
        <View style={styles.statusHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: color + '20' }]}
          >
            {React.cloneElement(icon, { size: 16, color })}
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={styles.statusDate}>
              {date ? formatDate(date) : 'Never'}
            </Text>
            {date && (
              <Text style={[styles.statusSince, { color }]}>
                {getTimeSince(date)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const ActionButton = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: color + '15', borderColor: color + '30' }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '25' }]}>
        {React.cloneElement(icon, { size: 18, color })}
      </View>
      <Text style={[styles.actionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorText}>Vehicle not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Vehicle Info */}
      <View style={styles.vehicleSection}>
        <View style={styles.vehicleImageContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
          <View style={styles.purchaseInfo}>
            <Calendar size={14} color="#9ca3af" />
            <Text style={styles.purchaseDate}>
              {new Date(vehicle.dateOfPurchase).getFullYear()}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Grid */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Maintenance Status</Text>
        <View style={styles.statusGrid}>
          <StatusCard title="Service" date={lastService?.date} icon={<Wrench />} type="service" />
          <StatusCard title="Fuel" date={lastFuel?.date} icon={<Droplets />} type="fuel" />
          <StatusCard title="Air Check" date={lastAir?.date} icon={<Wind />} type="air" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            title="Add Service"
            icon={<Wrench />}
            color="#3b82f6"
            onPress={() => router.push(`/vehicle/${id}/add-service`)}

          />
          <ActionButton
            title="Add Fuel"
            icon={<Droplets />}
            color="#ef4444"
            onPress={() => router.push(`/vehicle/${id}/add-fuel`)}
          />
          <ActionButton
            title="Add Air"
            icon={<Wind />}
            color="#06b6d4"
            onPress={() => router.push(`/vehicle/${id}/add-air`)}
          />
          <ActionButton
            title="View History"
            icon={<History />}
            color="#10b981"
            onPress={() => router.push(`/vehicle/${id}/view-records`)}
          />
        </View>
      </View>
    </View>
  );
};

export default VehicleDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f615',
    marginRight: 16,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vehicleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  purchaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseDate: {
    marginLeft: 6,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    minHeight: 90,
  },
  statusHeader: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusDate: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  statusSince: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
