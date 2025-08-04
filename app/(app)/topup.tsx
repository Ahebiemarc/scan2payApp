// File: app/(app)/topup.tsx - UPDATED

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform, // <-- Importez Platform
  KeyboardAvoidingView, // <-- Importez KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';
import { useWallet } from '@/contexts/WalletContext';
import { usePaymentMethods } from '@/contexts/PaymentMethodContext';
import AddPaymentMethodModal from '@/components/AddPaymentMethodModal';

const PRESET_AMOUNTS = [20, 50, 100, 200];

const getCardIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'visa':
      return require('../../assets/images/visa-logo.png');
    case 'mastercard':
      return require('../../assets/images/mastercard-logo.png');
    case 'paypal':
      return require('../../assets/images/paypal-logo.png');
    default:
        return require('../../assets/images/paypal-logo.png');

  }
};

export default function TopUpScreen() {
  const router = useRouter();
  const { wallet, topUp } = useWallet();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();

  const [amount, setAmount] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [isAddMethodModalVisible, setIsAddMethodModalVisible] = useState(false);

  const currentBalance = wallet?.balance ?? 0;

  useEffect(() => {
    if (!paymentMethodsLoading && paymentMethods.length > 0 && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, paymentMethodsLoading, selectedPaymentMethodId]);

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    if (numericValue.includes('.')) {
      const parts = numericValue.split('.');
      if (parts[1] && parts[1].length > 2) {
        setAmount(`${parts[0]}.${parts[1].substring(0, 2)}`);
        return;
      }
    }
    setAmount(numericValue);
  };

  const handlePresetAmount = (preset: number) => {
    setAmount(preset.toFixed(2));
  };

  const handleConfirmTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }
    if (topUpAmount > 10000) {
      Alert.alert('Erreur', 'Le montant ne peut pas dépasser 10 000 €.');
      return;
    }
    if (!selectedPaymentMethodId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de paiement.');
      return;
    }

    setIsTopUpLoading(true);
    try {
      const result = await topUp(
        topUpAmount,
        selectedPaymentMethodId,

        'Rechargement via application mobile'
      );

      if (result) {
        Alert.alert('Succès', `Votre compte a été rechargé de ${topUpAmount.toFixed(2)} €.`);
        setAmount('');
        router.back();
      } else {
        Alert.alert(
          'Erreur de rechargement',
          'Une erreur est survenue lors du rechargement. Veuillez réessayer.'
        );
      }
    } catch (error: any) {
      console.error('Erreur inattendue lors du top-up:', error);
      Alert.alert('Erreur inattendue', error.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsTopUpLoading(false);
    }
  };

  return (
    // Enveloppez le contenu avec KeyboardAvoidingView
    <KeyboardAvoidingView
      style={styles.fullScreenContainer} // Utilisez un style qui prend tout l'écran
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Comportement différent pour iOS/Android
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Ajustez si une barre fixe en haut masque le contenu
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          {/* Top Card */}
          <View style={styles.topCard}>
            <Text style={styles.topCardLabel}>Montant à Recharger</Text>
            <Text style={styles.topCardAmount}>€ {parseFloat(amount || '0').toFixed(2)}</Text>
            <Text style={styles.balanceText}>Solde Actuel : € {currentBalance.toFixed(2)}</Text>
          </View>

          {/* Amount Input */}
          <Text style={styles.sectionTitle}>Montant</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholderTextColor={COLORS.darkGrey}
            />
            <Text style={styles.currencySymbol}>€</Text>
          </View>

          {/* Preset Amounts */}
          <View style={styles.presetContainer}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.presetButton}
                onPress={() => handlePresetAmount(preset)}
              >
                <Text style={styles.presetText}>€{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Choose Card */}
          <Text style={styles.sectionTitle}>Choisir une Carte</Text>
          <View style={styles.cardSelectionContainer}>
            {paymentMethodsLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : paymentMethods.length === 0 ? (
              <Text style={styles.noPaymentMethodsText}>Aucune méthode de paiement trouvée.</Text>
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.cardOption,
                    selectedPaymentMethodId === method.id && styles.cardOptionSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethodId(method.id)}
                >
                  <Image source={getCardIcon(method.type)} style={styles.cardIcon} resizeMode="contain" />
                  <Text style={styles.cardMaskedIdentifier}>{method.maskedIdentifier}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity style={styles.addCardButton} onPress={() => setIsAddMethodModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={30} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Confirm Button */}
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <TouchableOpacity
              style={[styles.confirmButton, isTopUpLoading && styles.buttonDisabled]}
              onPress={handleConfirmTopUp}
              disabled={isTopUpLoading}
            >
              {isTopUpLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmer la Recharge</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Modal d'ajout de méthode de paiement */}
      <AddPaymentMethodModal
        isVisible={isAddMethodModalVisible}
        onClose={() => setIsAddMethodModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { // Nouveau style pour le KeyboardAvoidingView
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topCardLabel: {
    fontSize: 16,
    color: COLORS.white + 'cc',
    marginBottom: 5,
  },
  topCardAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
  },
  balanceText: {
    fontSize: 14,
    color: COLORS.white + 'aa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grey,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  amountInput: {
    flex: 1,
    height: 60,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkGrey,
    marginLeft: 10,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  presetButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  presetText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  cardOption: {
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 60,
  },
  cardOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cardIcon: {
    width: 40,
    height: 25,
  },
  cardMaskedIdentifier: {
    fontSize: 10,
    color: COLORS.darkGrey,
    marginTop: 5,
  },
  addCardButton: {
    borderWidth: 2,
    borderColor: COLORS.lightGrey,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 60,
    marginBottom: 10,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
    elevation: 0,
    shadowOpacity: 0,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPaymentMethodsText: {
    color: COLORS.darkGrey,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});