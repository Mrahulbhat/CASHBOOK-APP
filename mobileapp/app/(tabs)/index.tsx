import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { transactionApi, Transaction } from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { LogOut } from 'lucide-react-native';

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total';
type TransactionType = 'expense' | 'income' | 'investment';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('total');
  const [selectedTab, setSelectedTab] = useState<TransactionType>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getDateRange = (filter: FilterType) => {
    const now = new Date();
    switch (filter) {
      case 'daily':
        return {
          from: format(startOfDay(now), 'yyyy-MM-dd'),
          to: format(endOfDay(now), 'yyyy-MM-dd'),
        };
      case 'weekly':
        return {
          from: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          to: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        };
      case 'monthly':
        return {
          from: format(startOfMonth(now), 'yyyy-MM-dd'),
          to: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'yearly':
        return {
          from: format(startOfYear(now), 'yyyy-MM-dd'),
          to: format(endOfYear(now), 'yyyy-MM-dd'),
        };
      case 'total':
      default:
        return {};
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(selectedFilter);
      const filters = {
        ...dateRange,
        type: selectedTab,
      };
      const data = await transactionApi.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, selectedTab]);

  // Fetch transactions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  // Also fetch when filter or tab changes
  useEffect(() => {
    fetchTransactions();
  }, [selectedFilter, selectedTab, fetchTransactions]);

  const calculateTotal = () => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filters: FilterType[] = ['daily', 'weekly', 'monthly', 'yearly', 'total'];
  const tabs: { type: TransactionType; label: string }[] = [
    { type: 'expense', label: 'Expense' },
    { type: 'income', label: 'Income' },
    { type: 'investment', label: 'Investment' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with User Info and Logout */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#EF4444" size={20} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Transaction Type Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.type}
            style={[
              styles.tab,
              selectedTab === tab.type && styles.tabActive,
            ]}
            onPress={() => setSelectedTab(tab.type)}
          >
            <Text
              style={[
                styles.tabLabel,
                selectedTab === tab.type && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#60A5FA" />
        ) : (
          <>
            <Text style={styles.amountLabel}>
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Amount
            </Text>
            <Text style={styles.amountValue}>{formatAmount(calculateTotal())}</Text>
            <Text style={styles.periodLabel}>
              {selectedFilter === 'total'
                ? 'All Time'
                : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Period`}
            </Text>
          </>
        )}
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsContainer}
        contentContainerStyle={styles.transactionsContent}
      >
        {loading ? null : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {selectedTab} transactions found</Text>
            <Text style={styles.emptySubtext}>
              for the selected {selectedFilter} period
            </Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionCategory}>
                  {transaction.category.name}
                </Text>
                <Text style={styles.transactionAmount}>
                  {formatAmount(transaction.amount)}
                </Text>
              </View>
              {transaction.description && (
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
              )}
              <View style={styles.transactionFooter}>
                <Text style={styles.transactionDate}>
                  {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                </Text>
                <Text style={styles.transactionMode}>
                  {transaction.paymentMode === 'cash' ? '💵 Cash' : '🏦 Bank'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  filterContainer: {
    maxHeight: 60,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  tabActive: {
    backgroundColor: '#4F46E5',
  },
  tabLabel: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  amountContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  amountLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 4,
  },
  periodLabel: {
    color: '#888',
    fontSize: 12,
  },
  transactionsContainer: {
    flex: 1,
    padding: 16,
  },
  transactionsContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
  },
  transactionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionCategory: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  transactionAmount: {
    color: '#60A5FA',
    fontSize: 20,
    fontWeight: '700',
  },
  transactionDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    color: '#888',
    fontSize: 12,
  },
  transactionMode: {
    color: '#888',
    fontSize: 12,
  },
});

