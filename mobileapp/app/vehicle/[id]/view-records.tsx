import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Fuel,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { axiosInstance } from "../../../lib/axios";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ViewRecords() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "month" | "year">("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const vehicleRes = await axiosInstance.get(`/vehicle/${id}`);
        setVehicle(vehicleRes.data);
        const [svc, fuel, air] = await Promise.all([
          axiosInstance.get(`/service/vehicle/${id}`),
          axiosInstance.get(`/fuel/vehicle/${id}`),
          axiosInstance.get(`/air/vehicle/${id}`),
        ]);
        const combined = [
          ...svc.data.map((r) => ({ ...r, category: "service" })),
          ...fuel.data.map((r) => ({ ...r, category: "fuel" })),
          ...air.data.map((r) => ({ ...r, category: "air" })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const now = new Date();
  const filtered = records.filter((r) => {
    const d = new Date(r.date);
    return (
      filter === "all" ||
      (filter === "month" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) ||
      (filter === "year" && d.getFullYear() === now.getFullYear())
    );
  });

  const total = (cat) =>
    filtered
      .filter((r) => r.category === cat)
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const renderRecord = ({ item }) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return (
      <LinearGradient
        colors={["#23233b", "#181825"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.recordRow}
      >
        <View style={styles.rowLine}>
          <Text style={styles.cellDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <View style={styles.cellCategory}>
            {item.category === "fuel" ? (
              <Fuel size={16} color="#34D399" />
            ) : item.category === "service" ? (
              <Wrench size={16} color="#60A5FA" />
            ) : (
              <Calendar size={16} color="#06B6D4" />
            )}
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.cellAmount}>₹{item.amount ?? "-"}</Text>
        </View>

        <View style={styles.rowLine}>
          <Text style={styles.cellKm}>{item.km ? `${item.km} km` : "-"}</Text>
          <Text style={styles.cellDesc} numberOfLines={1} ellipsizeMode="tail">
            {item.desc || "-"}
          </Text>
        </View>
      </LinearGradient>
    );
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#181825" }}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <LinearGradient
          colors={["#2563eb30", "#a21caf20", "#000000"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft color="#60A5FA" size={22} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{vehicle?.name || "Vehicle"} Records</Text>

            <View style={styles.filterBar}>
              {[
                { key: "all", label: "All", icon: Calendar },
                { key: "month", label: "This Month", icon: Calendar },
                { key: "year", label: "This Year", icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterButton, filter === key && styles.filterActive]}
                  onPress={() => setFilter(key)}
                >
                  <Icon
                    color={filter === key ? "#fff" : "#60A5FA"}
                    size={16}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.filterText, filter === key && styles.filterTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsRow}>
              <LinearGradient
                colors={["#22d3ee40", "#34d39930"]}
                style={styles.statsCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statsIconWrap}>
                  <Fuel color="#34D399" size={20} />
                </View>
                <Text style={styles.statsLabel}>Total Fuel</Text>
                <Text style={styles.statsValue}>₹{total("fuel").toLocaleString()}</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#60a5fa40", "#818cf830"]}
                style={styles.statsCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statsIconWrap}>
                  <Wrench color="#60A5FA" size={20} />
                </View>
                <Text style={styles.statsLabel}>Total Service</Text>
                <Text style={styles.statsValue}>₹{total("service").toLocaleString()}</Text>
              </LinearGradient>

             
            </View>

            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#00f0ff" />
                <Text style={styles.loadingText}>Loading records...</Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.centered}>
                <Calendar color="#334155" size={32} />
                <Text style={styles.emptyText}>No Records Found</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={renderRecord}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  backText: { color: "#60A5FA", fontSize: 16, marginLeft: 4 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  filterBar: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 2,
    borderRadius: 20,
    backgroundColor: "#23233b",
  },
  filterActive: {
    backgroundColor: "#60A5FA",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  filterText: { color: "#60A5FA", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
    justifyContent: "space-between",
  },
  statsCard: {
    flex: 1,
    padding: 14,
    marginHorizontal: 2,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#23233b",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 4,
  },
  statsIconWrap: {
    backgroundColor: "#181825",
    borderRadius: 20,
    padding: 6,
    marginBottom: 4,
  },
  statsLabel: { fontSize: 12, color: "#aaa", marginBottom: 2 },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
  },
  recordRow: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 8,
  },
  rowLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  cellDate: {
    color: "#aaa",
    fontSize: 13,
    flex: 1,
  },
  cellCategory: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 13,
  },
  cellAmount: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  cellKm: {
    flex: 1,
    color: "#FBBF24",
    fontSize: 13,
  },
  cellDesc: {
    flex: 2,
    color: "#ccc",
    fontSize: 13,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#fff",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },
});
