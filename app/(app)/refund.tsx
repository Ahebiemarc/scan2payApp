// File: app/(app)/refund.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors'; // Adjust path

export default function RefundScreen() {
    const router = useRouter();
    const [transactionId, setTransactionId] = useState('');
    const [reason, setReason] = useState('');
    const [amount, setAmount] = useState(''); // Optional: allow partial refund
    const [loading, setLoading] = useState(false);

    const handleRefundRequest = async () => {
        if (!transactionId || !reason) {
            Alert.alert("Erreur", "Veuillez fournir l'ID de transaction et la raison du remboursement.");
            return;
        }
        // Optional: Validate amount if entered
        const refundAmount = parseFloat(amount);
        if (amount && (isNaN(refundAmount) || refundAmount <= 0)) {
             Alert.alert("Erreur", "Veuillez entrer un montant de remboursement valide.");
             return;
        }

        setLoading(true);
        // --- Simulate API Call for Refund Request ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Simulating refund request:", { transactionId, reason, amount: refundAmount || 'Full' });
        setLoading(false);

        Alert.alert("Succès", "Votre demande de remboursement a été soumise.");
        // Clear fields and navigate back or to history
        setTransactionId('');
        setReason('');
        setAmount('');
        router.back();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInUp.duration(500)}>
                <Text style={styles.title}>Demander un Remboursement</Text>
                <Text style={styles.subtitle}>Entrez les détails de la transaction à rembourser.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ID de la Transaction</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Entrez l'ID unique de la transaction"
                        value={transactionId}
                        onChangeText={setTransactionId}
                        placeholderTextColor={COLORS.darkGrey}
                    />
                </View>

                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>Montant à rembourser (Optionnel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Laisser vide pour un remboursement total"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.darkGrey}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Raison du remboursement</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Expliquez brièvement pourquoi vous demandez un remboursement..."
                        value={reason}
                        onChangeText={setReason}
                        placeholderTextColor={COLORS.darkGrey}
                        multiline={true}
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRefundRequest}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Soumettre la Demande</Text>}
                </TouchableOpacity>
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
        marginBottom: 25,
        textAlign: 'center',
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
        minHeight: 50, // Ensure minimum height
        backgroundColor: COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10, // Add vertical padding for multiline
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.grey,
        color: COLORS.black,
    },
     textArea: {
        height: 100, // Specific height for text area
        textAlignVertical: 'top', // Align text to top in multiline
    },
    button: {
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
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});