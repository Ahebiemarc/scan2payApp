// ============================================================
// File: app//(tabs)/dashboard.tsx
// Description: Dashboard screen, content varies by user role.
// ============================================================
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext'; // Import useWallet
import { useQrCode } from '@/contexts/QrCodeContext'; // Import useQrCode
import { TransactionDto } from '@/types/dto'; // Import TransactionDto for typing


export default function DashboardScreen() {
  const { user } = useAuth();
  const { wallet, transactions, loading: walletLoading, refetchWalletData } = useWallet(); // Get wallet data and refetch function
  const { qrCodeImage, loading: qrCodeLoading, refetchQrCode } = useQrCode(); // Get QR code data and refetch function

  const router = useRouter();
  const isMarchand = user?.userType === 'Marchand';
  const [refreshing, setRefreshing] = useState(false);

  // Combine loading states for the RefreshControl
  const overallLoading = walletLoading || qrCodeLoading;

  // Simulate data refresh (now calls actual context refetch functions)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWalletData(); // Refresh wallet and transactions
      if (isMarchand) {
        await refetchQrCode(); // Refresh QR code data if user is a merchant
      }
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
      // Optionally show an alert to the user
    } finally {
      setRefreshing(false);
    }
  }, [refetchWalletData, refetchQrCode, isMarchand]);

  // Use useEffect to ensure data is fetched on component mount if not already loading
  // (WalletContext and QrCodeContext already do this internally when `user` changes,
  // but this ensures consistency for the first load of this specific screen)
  useEffect(() => {
    // This useEffect is more about reacting to user changes or initial mount.
    // The contexts themselves already manage initial fetches based on 'user' existence.
    // We mainly rely on `onRefresh` for explicit user-initiated refresh.
  }, []); // Empty dependency array, as contexts handle their own initial fetch

  // Display only the first 3 recent transactions
  const recentTransactions = transactions.slice(0, 3);

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


  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <Animated.View entering={FadeInDown.duration(500)}>
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Utilisateur'}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde Actuel</Text>
          {overallLoading ? (
            <ActivityIndicator size="large" color={COLORS.white} style={styles.balanceLoading} />
          ) : (
            <Text style={styles.balanceAmount}>€ {wallet?.balance.toFixed(2) || '0.00'}</Text>
          )}
          {isMarchand ? (
            <Text style={styles.accountTypeLabel}>Compte Marchand</Text>
          ) : (
            <Text style={styles.accountTypeLabel}>Compte Client</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/qr-payment')}>
            <Ionicons name={isMarchand ? "qr-code" : "scan"} size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>{isMarchand ? 'Générer QR' : 'Scanner QR'}</Text>
          </TouchableOpacity>

          {!isMarchand && ( // Only show Topup for clients
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/topup')}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Recharger</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/withdraw')}>
            <Ionicons name="remove-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Retirer</Text>
          </TouchableOpacity>
          {isMarchand && ( // Only show Integrations for merchants
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/integrations')}>
              <Ionicons name="briefcase-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Intégrations</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          {overallLoading ? (
             <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingIndicator} />
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((tx, index) => {
              const { icon, color } = getTransactionIconAndColor(tx.type);
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={[
                    styles.transactionItem,
                    index < recentTransactions.length - 1 && styles.transactionItemBorder // Apply border to all except last
                  ]}
                  onPress={() => router.push({
                    pathname: '/(app)/transaction-detail',
                    params: { transactionData: JSON.stringify(tx) }
                  })}
                >
                  <Ionicons name={icon as any} size={24} color={color} />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                    <Text style={styles.transactionDate}>{new Date(tx.timestamp).toLocaleDateString()} - {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: color }]}>
                {tx.type === 'Deposit' || tx.type === 'PaymentReceived' || tx.type === 'RefundReceived' ? '+' : '-'}€ {tx.amount.toFixed(2)}

                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noDataText}>Aucune transaction récente.</Text>
          )}
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.viewAllLink}>Voir tout l'historique</Text>
          </TouchableOpacity>
        </View>

        

        {/* Placeholder for Integrations Preview (Optional) */}
        {isMarchand && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Aperçu Intégrations</Text>
            <View style={styles.integrationIcons}>
              <Ionicons name="logo-paypal" size={30} color="#003087" style={styles.integrationIcon} />
              <Ionicons name="card-outline" size={30} color="#6772e5" style={styles.integrationIcon} />
              <Ionicons name="call-outline" size={30} color="#FF7900" style={styles.integrationIcon} />
            </View>
            <TouchableOpacity onPress={() => router.push('/(app)/integrations')}>
              <Text style={styles.viewAllLink}>Gérer les intégrations</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light background
  },
  welcomeHeader: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.darkGrey,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.white + 'aa',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  balanceLoading: {
    marginTop: 5,
    marginBottom: 10,
  },
  accountTypeLabel: {
    fontSize: 14,
    color: COLORS.white + 'cc',
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 25,
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 5,
    flex: 1,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
  },
  loadingIndicator: {
    marginTop: 10,
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionItemBorder: { // New style for border
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDesc: {
    fontSize: 15,
    color: COLORS.black,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.darkGrey,
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.darkGrey,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  viewAllLink: {
    marginTop: 15,
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  integrationIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  integrationIcon: {
    marginHorizontal: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.lightGrey, // Background for the QR code area
    borderRadius: 10,
    marginBottom: 10,
  },
  qrCodePlaceholder: {
    fontSize: 16,
    color: COLORS.darkGrey,
    marginBottom: 10,
    // Add dimensions if you know the QR code image size
    width: 150, // Example size
    height: 150, // Example size
    textAlign: 'center',
    lineHeight: 150, // Center text vertically
    backgroundColor: COLORS.white, // Simulate QR code background
  },
  // qrCodeImage: { // Uncomment and use with Image component
  //   width: 200,
  //   height: 200,
  //   resizeMode: 'contain',
  // },
  qrCodeId: {
    fontSize: 12,
    color: COLORS.darkGrey,
    marginTop: 10,
  },
});