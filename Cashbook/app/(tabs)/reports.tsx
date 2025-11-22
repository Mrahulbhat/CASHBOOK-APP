import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionApi, Transaction } from '../../lib/api';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  subMonths,
} from 'date-fns';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react-native';

type PeriodType = 'monthly' | 'yearly';

export default function Reports() {
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [period]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const dateRange =
        period === 'monthly'
          ? {
              from: format(startOfMonth(now), 'yyyy-MM-dd'),
              to: format(endOfMonth(now), 'yyyy-MM-dd'),
            }
          : {
              from: format(startOfYear(now), 'yyyy-MM-dd'),
              to: format(endOfYear(now), 'yyyy-MM-dd'),
            };

      const data = await transactionApi.getTransactions(dateRange);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const investment = transactions
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    return { expense, income, investment, net };
  };

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {};
    transactions.forEach((transaction) => {
      const categoryName = transaction.category.name;
      if (!breakdown[categoryName]) {
        breakdown[categoryName] = 0;
      }
      breakdown[categoryName] += transaction.amount;
    });

    return Object.entries(breakdown)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getTopTransactions = () => {
    return [...transactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { expense, income, investment, net } = calculateTotals();
  const categoryBreakdown = getCategoryBreakdown();
  const topTransactions = getTopTransactions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <Pressable
            style={[styles.periodButton, period === 'monthly' && styles.periodButtonActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'monthly' && styles.periodTextActive,
              ]}
            >
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[styles.periodButton, period === 'yearly' && styles.periodButtonActive]}
            onPress={() => setPeriod('yearly')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'yearly' && styles.periodTextActive,
              ]}
            >
              Yearly
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#60A5FA" />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: '#1E3A5F' }]}>
                <View style={styles.summaryCardHeader}>
                  <DollarSign color="#60A5FA" size={24} />
                  <Text style={styles.summaryCardLabel}>Income</Text>
                </View>
                <Text style={styles.summaryCardValue}>{formatAmount(income)}</Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: '#3A1F1F' }]}>
                <View style={styles.summaryCardHeader}>
                  <TrendingDown color="#EF4444" size={24} />
                  <Text style={styles.summaryCardLabel}>Expense</Text>
                </View>
                <Text style={styles.summaryCardValue}>{formatAmount(expense)}</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: '#1F3A3A' }]}>
                <View style={styles.summaryCardHeader}>
                  <BarChart3 color="#3B82F6" size={24} />
                  <Text style={styles.summaryCardLabel}>Investment</Text>
                </View>
                <Text style={styles.summaryCardValue}>{formatAmount(investment)}</Text>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: net >= 0 ? '#1F3A2F' : '#3A1F1F',
                  },
                ]}
              >
                <View style={styles.summaryCardHeader}>
                  <TrendingUp color={net >= 0 ? '#10B981' : '#EF4444'} size={24} />
                  <Text style={styles.summaryCardLabel}>Net</Text>
                </View>
                <Text
                  style={[
                    styles.summaryCardValue,
                    { color: net >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {formatAmount(net)}
                </Text>
              </View>
            </View>

            {/* Top Transactions */}
            {topTransactions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Transactions</Text>
                <Text style={styles.sectionSubtitle}>Highest spending transactions</Text>
                <View style={styles.transactionList}>
                  {topTransactions.map((transaction, index) => {
                    const getTypeColor = (type: string) => {
                      switch (type) {
                        case 'expense':
                          return '#EF4444';
                        case 'income':
                          return '#10B981';
                        case 'investment':
                          return '#3B82F6';
                        default:
                          return '#888';
                      }
                    };

                    return (
                      <View key={transaction._id} style={styles.transactionItem}>
                        <View style={styles.transactionRank}>
                          <View
                            style={[
                              styles.rankBadge,
                              {
                                backgroundColor:
                                  index === 0
                                    ? '#F59E0B'
                                    : index === 1
                                    ? '#6B7280'
                                    : index === 2
                                    ? '#92400E'
                                    : '#2A2A2A',
                              },
                            ]}
                          >
                            <Text style={styles.rankText}>#{index + 1}</Text>
                          </View>
                        </View>
                        <View style={styles.transactionDetails}>
                          <View style={styles.transactionHeader}>
                            <Text style={styles.transactionCategory}>
                              {transaction.category.name}
                            </Text>
                            <Text
                              style={[
                                styles.transactionAmount,
                                { color: getTypeColor(transaction.type) },
                              ]}
                            >
                              {formatAmount(transaction.amount)}
                            </Text>
                          </View>
                          {transaction.description && (
                            <Text style={styles.transactionDescription} numberOfLines={1}>
                              {transaction.description}
                            </Text>
                          )}
                          <View style={styles.transactionMeta}>
                            <View
                              style={[
                                styles.typeBadge,
                                { backgroundColor: getTypeColor(transaction.type) + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeText,
                                  { color: getTypeColor(transaction.type) },
                                ]}
                              >
                                {transaction.type.charAt(0).toUpperCase() +
                                  transaction.type.slice(1)}
                              </Text>
                            </View>
                            <Text style={styles.transactionDate}>
                              {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                            </Text>
                            <Text style={styles.transactionMode}>
                              {transaction.paymentMode === 'cash' ? '💵' : '🏦'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                <View style={styles.categoryList}>
                  {categoryBreakdown.map((category, index) => {
                    const total = transactions.reduce(
                      (sum, t) => sum + (t.category.name === category.name ? t.amount : 0),
                      0
                    );
                    const percentage = total > 0 ? (category.amount / total) * 100 : 0;
                    const maxAmount = Math.max(...categoryBreakdown.map((c) => c.amount));

                    return (
                      <View key={index} style={styles.categoryItem}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{category.name}</Text>
                          <Text style={styles.categoryAmount}>
                            {formatAmount(category.amount)}
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${(category.amount / maxAmount) * 100}%`,
                                backgroundColor:
                                  index % 3 === 0
                                    ? '#60A5FA'
                                    : index % 3 === 1
                                    ? '#10B981'
                                    : '#C084FC',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Transactions</Text>
                  <Text style={styles.statValue}>{transactions.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Avg. Transaction</Text>
                  <Text style={styles.statValue}>
                    {transactions.length > 0
                      ? formatAmount(
                          transactions.reduce((sum, t) => sum + t.amount, 0) /
                            transactions.length
                        )
                      : formatAmount(0)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
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
    padding: 16,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#4F46E5',
  },
  periodText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  summaryCardLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryAmount: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    gap: 12,
  },
  transactionRank: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionCategory: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionDescription: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionDate: {
    color: '#888',
    fontSize: 12,
    flex: 1,
  },
  transactionMode: {
    color: '#888',
    fontSize: 14,
  },
});

