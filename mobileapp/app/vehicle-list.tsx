// Enhanced VehicleListScreen with Tailwind-style visuals in Expo
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicleStore } from "../store/useVehicleStore";

export default function VehicleListScreen() {
  const { vehicles, getVehicles, isVehiclesLoading } = useVehicleStore();
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getVehicles();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (isVehiclesLoading && vehicles.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00f0ff" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {vehicles.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.title}>No vehicles found</Text>
          </View>
        ) : (
          <>
            <Text style={styles.heading}>Select a Vehicle</Text>
            <FlatList
              data={vehicles}
              contentContainerStyle={styles.list}
              keyExtractor={(item) => item._id}
              refreshing={isVehiclesLoading}
              onRefresh={getVehicles}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cardWrapper}
                  onPress={() =>
                    router.push({
                      pathname: "/VehicleDashboard/[id]",
                      params: { id: item._id },
                    })
                  }
                >
                  <LinearGradient
                    colors={["#1e293b", "#0f172a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <Animated.View
                      style={[
                        styles.imageContainer,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                      />
                    </Animated.View>
                    <Text style={styles.name}>{item.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  cardWrapper: {
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 80,
    padding: 3,
    backgroundColor: "#1e40af",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "#334155",
  },
  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
