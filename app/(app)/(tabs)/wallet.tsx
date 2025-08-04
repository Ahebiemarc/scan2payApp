// ============================================================
// File: app/(tabs)/wallet.tsx
// Description: Wallet screen showing balance and full transaction history.
// ============================================================
import React, { useCallback } from 'react'; // Ajout de useCallback
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'; // Ajout d'ActivityIndicator et RefreshControl
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext'; // Ajustez le chemin si nécessaire
import { useWallet } from '@/contexts/WalletContext'; // *** NOUVEL IMPORT ***
import { TransactionDto } from '@/types/dto'; // *** NOUVEL IMPORT pour le typage ***
import { SafeAreaView } from 'react-native-safe-area-context';


export default function WalletScreen() {
  const { user } = useAuth(); // Récupère les infos utilisateur depuis AuthContext
  const { wallet, transactions, loading, refetchWalletData } = useWallet(); // Récupère le solde et les transactions depuis WalletContext

  const router = useRouter();

  // Correction : Utilisez user?.userType pour vérifier le rôle de l'utilisateur
  const isMarchand = user?.userType === 'Marchand';

  const [refreshing, setRefreshing] = React.useState(false); // État pour RefreshControl

  // Fonction pour le pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWalletData(); // Appelle la fonction de rafraîchissement du WalletContext
    } catch (error) {
      console.error("Échec du rafraîchissement des données du portefeuille:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWalletData]);

  // Fonction utilitaire pour obtenir l'icône et la couleur de la transaction
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

  // Composant de rendu pour chaque élément de transaction, optimisé avec useCallback
  const renderTransaction = useCallback(({ item }: { item: TransactionDto }) => {
    const { icon, color } = getTransactionIconAndColor(item.type);
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push({
          pathname: '/(app)/transaction-detail',
          params: { transactionData: JSON.stringify(item) } // Passe les données complètes
        })}
      >
        <Ionicons name={icon as any} size={28} color={color} />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDesc}>{item.description}</Text>
          {/* Correction : Utilisation de item.timestamp */}
          <Text style={styles.transactionDate}>
            {new Date(item.timestamp).toLocaleDateString()} - {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {/* Correction : Utilisation de la couleur déterminée par getTransactionIconAndColor */}
        <Text style={[styles.transactionAmount, { color: color }]}>
          {item.type === 'PaymentReceived' || item.type === 'Deposit' ? '+' : '-'}€ {item.amount.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  }, []); // Dépendances vides car item et getTransactionIconAndColor sont stables

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']} >
      {/* En-tête du Solde */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Solde Disponible</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.white} style={styles.balanceLoadingIndicator} />
        ) : (
          <Text style={styles.balanceAmount}>€ {wallet?.balance?.toFixed(2) || '0.00'}</Text> // Affiche '0.00' si balance est null/undefined
        )}
        <View style={styles.actionButtonsContainer}>
          
          {!isMarchand && ( // Only show Topup for clients
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/topup')}>
              <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Recharger</Text>
            </TouchableOpacity>
            )}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/withdraw')}>
            <Ionicons name="remove-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Retirer</Text>
          </TouchableOpacity>
          {/* Le bouton Remboursement est généralement pour les marchands */}
          {isMarchand && (
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/refund')}>
              <Ionicons name="arrow-undo-circle" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Remboursement</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Titre de l'Historique des Transactions */}
      <Text style={styles.historyTitle}>Historique des Transactions</Text>

      {/* Liste des Transactions */}
      {loading && (transactions === null || transactions.length === 0) ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.listLoadingIndicator} />
      ) : (
        <FlatList
          data={transactions} // Utilise les vraies transactions
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.noDataText}>Aucune transaction disponible.</Text>
          }
          refreshControl={ // Ajout du RefreshControl
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  balanceHeader: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.white + 'aa',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: 10,
  },
  balanceLoadingIndicator: { // Nouveau style pour l'indicateur de chargement du solde
    marginVertical: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginVertical: 15,
    marginLeft: 15,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
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
    marginTop: 30,
    fontSize: 16,
    color: COLORS.darkGrey,
  },
  listLoadingIndicator: { // Nouveau style pour l'indicateur de chargement de la liste
    marginTop: 30,
  },
});