// components/AddPaymentMethodModal.tsx - UPDATED
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform, // <-- Importez Platform
  KeyboardAvoidingView, // <-- Importez KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { CreatePaymentMethodDto } from '@/types/dto';
import { usePaymentMethods } from '@/contexts/PaymentMethodContext';

interface AddPaymentMethodModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AddPaymentMethodModal({ isVisible, onClose }: AddPaymentMethodModalProps) {
  const { addMethod } = usePaymentMethods();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const getCardType = (number: string): 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | '' => {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    return '';
  };

  const handleSubmit = async () => {
    // ... (vos validations des champs locaux)

    // Important: ces validations locales sont toujours utiles si vous collectez les détails de la carte
    // avant de générer un token, mais les champs ne seront plus envoyés directement à l'API.
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !cardHolderName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    // ... (autres validations de format pour cardNumber, cvc, etc.)

    const cardTypeDetected = getCardType(cardNumber.replace(/\s/g, '')); // Ceci est le type de carte (Visa, Mastercard, etc.)
    if (!cardTypeDetected) {
      Alert.alert('Erreur', 'Type de carte non reconnu.');
      return;
    }

    setLoading(true);
    try {
        // --- NOUVELLE STRUCTURE DE newMethodData pour correspondre à l'API ---
        const newMethodData: CreatePaymentMethodDto = {
            // 'Card' car c'est une carte bancaire. Si c'était PayPal, ce serait 'PayPal'.
            Type: "Card",
            // Le fournisseur de la carte (Visa, Mastercard, etc.)
            // ou le nom de la passerelle si votre API utilise 'Stripe' ici.
            // Si votre API attend le type de carte (Visa/Mastercard) ici:
            Provider: cardTypeDetected, // Utilisez le type de carte détecté comme Provider
            
            // Pour la simulation, générez un token simple.
            // EN PRODUCTION: Ce token viendrait du SDK de votre passerelle de paiement (ex: Stripe, PayPal).
            TokenFromGateway: `simulated_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            
            IsDefault: false // Ou la valeur de votre checkbox IsDefault si vous l'ajoutez
        };

        console.log("Données envoyées à l'API (nouvelle structure):", newMethodData);

        await addMethod(newMethodData);
        Alert.alert('Succès', 'Méthode de paiement ajoutée avec succès !');
        onClose();
        // Réinitialiser les champs du formulaire après succès
        setCardNumber('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvc('');
        setCardHolderName('');
    } catch (error: any) {
        console.error("Erreur lors de l'ajout de la méthode de paiement:", error);
        if (error.response) {
            console.error("Détails de l'erreur API:", error.response.data);
            Alert.alert(
                "Erreur API",
                error.response.data.message ||
                (typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data) ||
                "Une erreur est survenue côté serveur."
            );
        } else {
            Alert.alert("Erreur réseau", "Impossible de joindre le serveur. Vérifiez votre connexion.");
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView // <-- Ajoutez KeyboardAvoidingView ici
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Ajustez le keyboardVerticalOffset si votre modal a un header fixe
        // ou si vous avez besoin d'un espace supplémentaire au-dessus du clavier.
        // 0 est un bon point de départ pour une modal qui part du bas.
        keyboardVerticalOffset={0}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.darkGrey} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ajouter une Nouvelle Carte</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            <Text style={styles.inputLabel}>Numéro de carte</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX XXXX"
              keyboardType="numeric"
              value={cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()}
              onChangeText={setCardNumber}
              maxLength={19}
              placeholderTextColor={COLORS.grey}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Mois Exp.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  keyboardType="numeric"
                  value={expiryMonth}
                  onChangeText={(text) => setExpiryMonth(text.replace(/[^0-9]/g, '').substring(0, 2))}
                  maxLength={2}
                  placeholderTextColor={COLORS.grey}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Année Exp.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA"
                  keyboardType="numeric"
                  value={expiryYear}
                  onChangeText={(text) => setExpiryYear(text.replace(/[^0-9]/g, '').substring(0, 2))}
                  maxLength={2}
                  placeholderTextColor={COLORS.grey}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="XXX"
                  keyboardType="numeric"
                  value={cvc}
                  onChangeText={(text) => setCvc(text.replace(/[^0-9]/g, '').substring(0, 4))}
                  maxLength={4}
                  secureTextEntry
                  placeholderTextColor={COLORS.grey}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Nom du titulaire</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom sur la carte"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              placeholderTextColor={COLORS.grey}
            />

            <TouchableOpacity
              style={[styles.addButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.addButtonText}>Ajouter la carte</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  formContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.darkGrey,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
    opacity: 0.7,
  },
});