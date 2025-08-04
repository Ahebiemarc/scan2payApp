// ============================================================
// File: app/(tabs)/history.tsx
// Description: Dedicated screen for full transaction history with filters.
// ============================================================
import React, { useState, useMemo, useCallback } from 'react'; // Added useCallback
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native'; // Added ActivityIndicator, RefreshControl
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated'; // Keep FadeIn for the main container if desired
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { useWallet } from '@/contexts/WalletContext'; // *** NEW IMPORT ***
import { TransactionDto } from '@/types/dto'; // *** NEW IMPORT for type safety ***
import { SafeAreaView } from 'react-native-safe-area-context';

type TransactionTypeFilter = 'all' | 'received' | 'sent';

export default function HistoryScreen() {
  const router = useRouter();
  const { transactions, loading, refetchWalletData } = useWallet(); // Get real data, loading state, and refetch function

  const [filter, setFilter] = useState<TransactionTypeFilter>('all'); // Filter state
  const [refreshing, setRefreshing] = useState(false); // State for RefreshControl

  // --- Pull-to-refresh functionality ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWalletData(); // Call the refetch function from WalletContext
    } catch (error) {
      console.error("Failed to refresh transaction history:", error);
      // Optionally show an alert to the user
    } finally {
      setRefreshing(false);
    }
  }, [refetchWalletData]);

  // Filter transactions based on the selected filter and real data
  const filteredTransactions = useMemo(() => {
    // Ensure transactions is an array before filtering
    const transactionsToFilter = transactions || [];

    if (filter === 'all') {
      return transactionsToFilter;
    }
    if (filter === 'received') {
      // Combine received and topup for "Reçu" filter
      return transactionsToFilter.filter(tx => tx.type === 'PaymentReceived' || tx.type === 'Deposit');
    }
    if (filter === 'sent') {
      // Combine sent and withdrawal for "Envoyé" filter
      return transactionsToFilter.filter(tx => tx.type === 'PaymentSent' || tx.type === 'Withdrawal');
    }
    return transactionsToFilter; // Fallback
  }, [filter, transactions]); // Depend on 'transactions' now

 

  // Helper to get transaction icon name and color
    const getTransactionIconAndColor = (type: TransactionDto['type']) => {
      switch (type) {
        case 'Deposit': // Recharge
        case 'PaymentReceived': // Paiement reçu
          return { icon: 'arrow-down-circle', color: COLORS.success }; // Vert pour les montants entrants
        case 'Withdrawal': // Retrait
        case 'PaymentSent': // Paiement effectué
          return { icon: 'arrow-up-circle', color: COLORS.error }; // Rouge pour les montants sortants
        case 'RefundReceived': // Remboursement reçu
          return { icon: 'cash', color: COLORS.info }; // Couleur neutre ou bleue pour les remboursements reçus
        case 'RefundIssued': // Remboursement émis
          return { icon: 'cash-outline', color: COLORS.darkGrey }; // Couleur grise pour les remboursements émis
        default:
          return { icon: 'information-circle', color: COLORS.darkGrey }; // Icône par défaut
      }
    };

  const renderTransaction = useCallback(({ item }: { item: TransactionDto }) => { // Type 'item' correctly
    const { icon, color } = getTransactionIconAndColor(item.type);
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push({
          pathname: '/(app)/transaction-detail',
          params: { transactionData: JSON.stringify(item) }
        })}
      >
        <Ionicons
          name={icon as any} // Cast to any because Ionicons name prop is a string, but the actual string values are from a fixed set
          size={28}
          color={color}
        />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDesc}>{item.description}</Text>
          {/* *** UPDATED: Use item.timestamp for date and time *** */}
          <Text style={styles.transactionDate}>
            {new Date(item.timestamp).toLocaleDateString()} - {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: color }]}> {/* Use semantic color here */}
          {item.type === 'PaymentReceived' || item.type === 'Deposit' ? '+' : '-'}€ {item.amount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  }, []); // Empty dependency array, assuming getTransactionIconAndColor is stable

  

  // Handle filter change for SegmentedControl
  const onFilterChange = (eventOrValue: any) => {
    let selectedIndex = -1;
    if (Platform.OS === 'ios') {
      selectedIndex = eventOrValue.nativeEvent.selectedSegmentIndex;
    } else {
      // For Android buttons, the value is passed directly
      const filters: TransactionTypeFilter[] = ['all', 'received', 'sent'];
      selectedIndex = filters.indexOf(eventOrValue);
    }

    const filters: TransactionTypeFilter[] = ['all', 'received', 'sent'];
    if (selectedIndex >= 0 && selectedIndex < filters.length) {
      setFilter(filters[selectedIndex]);
    }
  };

  return (
    <View  style={styles.container}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.fullWidth}> {/* Ensure it takes full width */}
        {/* Filter Buttons/Segmented Control */}
        <View style={styles.filterContainer}>
          {Platform.OS === 'ios' ? (
            <SegmentedControl
              values={['Tout', 'Reçu', 'Envoyé']}
              selectedIndex={['all', 'received', 'sent'].indexOf(filter)}
              onChange={onFilterChange}
              tintColor={COLORS.primary}
              style={styles.segmentedControl}
              fontStyle={{ color: COLORS.primary }}
              activeFontStyle={{ color: COLORS.white }}
            />
          ) : (
            // Simple buttons for Android
            <View style={styles.androidFilterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => onFilterChange('all')}>
                <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>Tout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'received' && styles.filterButtonActive]}
                onPress={() => onFilterChange('received')}>
                <Text style={[styles.filterButtonText, filter === 'received' && styles.filterButtonTextActive]}>Reçu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filter === 'sent' && styles.filterButtonActive]}
                onPress={() => onFilterChange('sent')}>
                <Text style={[styles.filterButtonText, filter === 'sent' && styles.filterButtonTextActive]}>Envoyé</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading && filteredTransactions.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.initialLoadingIndicator} />
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading ? <Text style={styles.noDataText}>Aucune transaction pour ce filtre.</Text> : null
            }
            refreshControl={ // Add RefreshControl to FlatList directly
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullWidth: {
    flex: 1, // Make sure Animated.View takes full height
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  segmentedControl: {
    height: 32,
  },
  androidFilterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 2,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  transactionDesc: {
    fontSize: 15,
    color: COLORS.black,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.darkGrey,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.darkGrey,
  },
  initialLoadingIndicator: {
    marginTop: 50, // Center it more vertically
  }
});