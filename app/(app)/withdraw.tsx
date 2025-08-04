import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';
import { useWallet } from '@/contexts/WalletContext';
import { usePaymentMethods } from '@/contexts/PaymentMethodContext';
import { PaymentMethodDto } from '@/types/dto';

export default function WithdrawScreen() {
    const router = useRouter();
    const {
        wallet,
        withdraw,
        loading: walletDataLoading,
        error: walletError,
    } = useWallet();

    const {
        paymentMethods, // paymentMethods est déjà filtré pour les 'BankAccount' par PaymentMethodContext
        loading: loadingPaymentMethods,
    } = usePaymentMethods();

    const [amount, setAmount] = useState('');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const currentBalance = wallet?.balance || 0;

    // Pré-sélectionne la première méthode de paiement disponible si aucune n'est sélectionnée
    useEffect(() => {
        if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
            setSelectedPaymentMethodId(paymentMethods[0].id);
        }
    }, [paymentMethods, selectedPaymentMethodId]);


    const handleAmountChange = (text: string) => {
        const numericValue = text.replace(/[^0-9.,]/g, '').replace(',', '.');
        setAmount(numericValue);
    };

    const handleWithdraw = async () => {
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            Alert.alert("Erreur", "Veuillez entrer un montant valide.");
            return;
        }
        if (withdrawAmount > currentBalance) {
            Alert.alert("Erreur", "Montant de retrait supérieur au solde disponible.");
            return;
        }
        if (!selectedPaymentMethodId) {
            Alert.alert("Erreur", "Veuillez sélectionner un compte bancaire pour le retrait.");
            return;
        }

        const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);
        if (!selectedMethod) {
            Alert.alert("Erreur", "Méthode de paiement sélectionnée introuvable.");
            return;
        }

        setSubmitting(true);
        try {
            const transaction = await withdraw(
                withdrawAmount,
                selectedPaymentMethodId, // Utilise l'ID de la méthode de paiement sélectionnée
                `Retrait vers ${selectedMethod.provider} (${selectedMethod.maskedIdentifier})` // Description dynamique
            );

            if (transaction) {
                Alert.alert("Succès", `Votre demande de retrait de ${withdrawAmount.toFixed(2)} € a été initiée. ID de transaction: ${transaction.id}`);
                setAmount('');
                setSelectedPaymentMethodId(null); // Réinitialiser la sélection
                router.back();
            } else {
                // Assuming withdraw function updates walletError if there's an issue
                Alert.alert("Échec du retrait", walletError || "Une erreur inconnue est survenue lors du retrait.");
            }
        } catch (error: any) {
            console.error("Erreur lors du retrait dans le composant:", error);
            Alert.alert("Échec du retrait", error.message || "Une erreur est survenue lors de votre demande de retrait.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderPaymentMethodItem = ({ item }: { item: PaymentMethodDto }) => (
        // `paymentMethods` est déjà filtré par le contexte pour être de type 'BankAccount',
        // donc nous n'avons pas besoin de vérifier `item.type === 'BankAccount'` ici.
        <TouchableOpacity
            style={[
                styles.paymentMethodItem,
                selectedPaymentMethodId === item.id && styles.selectedPaymentMethodItem
            ]}
            onPress={() => setSelectedPaymentMethodId(item.id)}
        >
            <View style={styles.radioCircle}>
                {selectedPaymentMethodId === item.id && <View style={styles.selectedRadioFill} />}
            </View>
            <View>
                <Text style={styles.paymentMethodText}>
                    {item.provider} - {item.maskedIdentifier}
                </Text>
                <Text style={styles.paymentMethodDetails}>Compte bancaire</Text>
            </View>
            <Ionicons
                name={"wallet-outline"}
                size={24}
                color={COLORS.darkGrey}
                style={{ marginLeft: 'auto' }}
            />
        </TouchableOpacity>
    );

    const bankAccountsAvailable = paymentMethods.length > 0; // Vérifiez directement la longueur de paymentMethods

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInUp.duration(500)}>
                <Text style={styles.title}>Retirer des Fonds</Text>
                <Text style={styles.subtitle}>Transférez des fonds vers votre compte bancaire.</Text>

                {walletDataLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.balanceText}>Solde Disponible : € {currentBalance.toFixed(2)}</Text>
                )}
                {walletError && <Text style={styles.errorText}>{walletError}</Text>}

                {/* Montant à Retirer */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Montant à Retirer</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.darkGrey}
                    />
                </View>

                {/* Section de sélection de la méthode de paiement */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sélectionnez un compte bancaire</Text>
                    {loadingPaymentMethods ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
                    ) : (
                        <>
                            {bankAccountsAvailable ? (
                                <FlatList
                                    data={paymentMethods} // Utilisez directement paymentMethods car il est déjà filtré
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderPaymentMethodItem}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.paymentMethodsList}
                                />
                            ) : (
                                <Text style={styles.infoText}>
                                    Aucune méthode de paiement de type "Compte Bancaire" n'a été ajoutée. Vous pouvez en ajouter une dans les paramètres de votre compte.
                                </Text>
                            )}
                        </>
                    )}
                </View>

                {/* Informations supplémentaires sur les frais/délais */}
                <Text style={styles.infoText}>
                    Des frais de transaction peuvent s'appliquer. Le traitement peut prendre 1 à 3 jours ouvrables.
                </Text>

                {/* Bouton Confirmer */}
                <Animated.View entering={FadeInDown.duration(500).delay(200)}>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            (submitting || walletDataLoading || loadingPaymentMethods || !selectedPaymentMethodId || !bankAccountsAvailable) && styles.buttonDisabled
                        ]}
                        onPress={handleWithdraw}
                        disabled={submitting || walletDataLoading || loadingPaymentMethods || !selectedPaymentMethodId || !bankAccountsAvailable}
                    >
                        {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.confirmButtonText}>Confirmer le Retrait</Text>}
                    </TouchableOpacity>
                </Animated.View>

            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.darkGrey,
        marginBottom: 15,
        textAlign: 'center',
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 25,
    },
    errorText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGrey,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.grey,
        color: COLORS.black,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.darkGrey,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        fontStyle: 'italic',
    },
    confirmButton: {
        width: '100%',
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        shadowColor: "#000",
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
    // Styles for payment method selection
    paymentMethodsList: {
        marginTop: 10,
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.grey,
    },
    selectedPaymentMethodItem: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    paymentMethodText: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    paymentMethodDetails: {
        fontSize: 12,
        color: COLORS.darkGrey,
        marginTop: 2,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.darkGrey,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedRadioFill: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});