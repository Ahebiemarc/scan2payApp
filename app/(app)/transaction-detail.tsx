// File: app/(app)/transaction-detail.tsx - UPDATED (Modal + PDF Generation)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native'; // Import Image
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { COLORS } from '../../constants/Colors'; // Adjust path
import * as Print from 'expo-print'; // Import Print
import * as Sharing from 'expo-sharing'; // Import Sharing
import { Asset } from 'expo-asset'; // Import Asset
import { generateReceiptHtml } from '@/components/generateReceiptHtml';
// Assurez-vous que TransactionDto est importé et bien typé comme discuté précédemment
import { TransactionDto } from '@/types/dto'; 


// Helper function (reuse from modal display logic)
export const getStatusStyle = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
        case 'completed': return { color: COLORS.success, text: 'Terminé' }; // Changed from 'complete' to 'completed'
        case 'pending': return { color: COLORS.warning, text: 'En attente' };
        case 'failed': return { color: COLORS.error, text: 'Échoué' };
        default: return { color: COLORS.darkGrey, text: status || 'Inconnu' };
    }
};


export default function TransactionDetailScreen() {
    const router = useRouter();
    const { transactionData } = useLocalSearchParams<{ transactionData?: string }>();
    const [isDownloading, setIsDownloading] = useState(false); // State for loading indicator

    let transaction: TransactionDto | undefined; // Explicitly type transaction
    try {
        if (transactionData) {
            transaction = JSON.parse(transactionData);
        }
    } catch (e) {
        console.error("Failed to parse transaction data:", e);
    }

    // --- Function to handle PDF generation and sharing ---
    const handleDownloadReceipt = async () => {
        if (!transaction) {
            Alert.alert("Erreur", "Données de transaction invalides pour générer le reçu.");
            return;
        }
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil.");
            return;
        }

        setIsDownloading(true); // Show loading indicator

        try {
            // 1. Generate HTML
            const htmlContent = await generateReceiptHtml(transaction); // generateReceiptHtml needs to handle new types

            // 2. Generate PDF from HTML
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false, // We want the file URI
            });

            // 3. Share the PDF
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Reçu Transaction ${transaction.id}`, // Title for the share dialog
                UTI: '.pdf', // Uniform Type Identifier for iOS
            });

        } catch (error) {
            console.error("Error generating or sharing PDF:", error);
            Alert.alert("Erreur", "Impossible de générer ou partager le reçu.");
        } finally {
            setIsDownloading(false); // Hide loading indicator
        }
    };


    if (!transaction) {
        return (
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} activeOpacity={1} />
                <Animated.View style={styles.modalContentError} entering={SlideInDown.duration(300)} exiting={SlideOutDown.duration(300)}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={30} color={COLORS.darkGrey} />
                    </TouchableOpacity>
                    <Text style={styles.errorText}>Détails de la transaction non disponibles.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Retour</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    // --- MISE À JOUR DE LA LOGIQUE isReceived ---
    const isReceived = transaction.type === 'PaymentReceived' || transaction.type === 'Deposit' || transaction.type === 'RefundReceived';
    
    const amountColor = isReceived ? COLORS.success : COLORS.error; // Change to COLORS.error for outgoing
    const amountSign = isReceived ? '+' : '-';

    // Formatter la date et l'heure à partir du timestamp
    const transactionDate = new Date(transaction.timestamp).toLocaleDateString();
    const transactionTime = new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Déterminez l'icône et la couleur comme dans dashboard.tsx pour la cohérence
    const getIconAndColor = (type: TransactionDto['type']) => {
        switch (type) {
            case 'Deposit':
            case 'PaymentReceived':
                return { icon: 'arrow-down-circle', color: COLORS.success };
            case 'Withdrawal':
            case 'PaymentSent':
                return { icon: 'arrow-up-circle', color: COLORS.error };
            case 'RefundReceived':
                return { icon: 'cash', color: COLORS.info };
            case 'RefundIssued':
                return { icon: 'cash-outline', color: COLORS.darkGrey };
            default:
                return { icon: 'information-circle', color: COLORS.darkGrey };
        }
    };
    const { icon, color } = getIconAndColor(transaction.type);
    const statusStyle = getStatusStyle(transaction.status);


    return (
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} activeOpacity={1} />
            <Animated.View
                style={styles.modalContent}
                entering={SlideInDown.duration(300)}
                exiting={SlideOutDown.duration(300)}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={30} color={COLORS.grey} />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Ionicons
                        name={icon as any} // Use the icon determined by type
                        size={40}
                        color={color} // Use the color determined by type
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{transaction.description}</Text>
                        {/* recipientName n'est pas dans le DTO fourni. Affiche un libellé général. */}
                        {/* Si vous avez recipientName, assurez-vous de l'ajouter à TransactionDto */}
                        {/* <Text style={styles.headerSubtitle}>
                             {isReceived ? `De: ${transaction.recipientName || 'Inconnu'}` : `À: ${transaction.recipientName || 'Inconnu'}`}
                        </Text> */}
                        <Text style={styles.headerSubtitle}>
                            Type: {transaction.type}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {amountSign} € {transaction.amount.toFixed(2)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.color + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                </View>
                <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                    {/* originalAmount et fee ne semblent pas être dans le DTO fourni. Commentez ou adaptez. */}
                    {/* <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Montant envoyé/demandé</Text>
                        <Text style={styles.detailValue}>€ {transaction.originalAmount?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Frais de transaction</Text>
                        <Text style={styles.detailValue}>€ {transaction.fee?.toFixed(2) || '0.00'}</Text>
                    </View> */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Montant final</Text>
                        <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>€ {transaction.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID de Transaction</Text>
                        <Text style={styles.detailValue}>{transaction.id}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{transactionDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Heure</Text>
                        <Text style={styles.detailValue}>{transactionTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Référence externe</Text>
                        <Text style={styles.detailValue}>{transaction.referenceId || 'N/A'}</Text>
                    </View>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Action", "Signaler un problème (à implémenter)")}>
                        <Ionicons name="flag-outline" size={18} color={COLORS.error} />
                        <Text style={styles.actionButtonText}>Signaler un problème</Text>
                    </TouchableOpacity>
                    {/* Updated Download Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleDownloadReceipt}
                        disabled={isDownloading} // Disable button while processing
                    >
                        <Ionicons name="download-outline" size={18} color={isDownloading ? COLORS.grey : COLORS.primary} />
                        {isDownloading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 10 }}/>
                        ) : (
                            <Text style={[styles.actionButtonText, {color: COLORS.primary}]}>Télécharger le reçu</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </View>
    );
}
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Align modal to bottom
        alignItems: 'center',
        backgroundColor: 'transparent', // Important for router modal presentation
    },
      backdrop: {
        ...StyleSheet.absoluteFillObject, // Cover screen
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    },
    modalContent: {
        width: '100%',
        height: '80%', // Adjust height as needed
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingTop: 15, // Less padding top because of close button
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 }, // Shadow for modal effect
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    modalContentError: { // Style for error state
        width: '90%',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
          // Position it manually if needed, or let flexbox handle it
        // position: 'absolute',
        // top: '30%',
          shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 10,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 20,
    },
      errorButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    errorButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 1, // Ensure it's clickable
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingRight: 30, // Space for close button
    },
      headerTextContainer: {
        marginLeft: 15,
        flex: 1, // Allow text to wrap
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
      headerSubtitle: {
        fontSize: 14,
        color: COLORS.darkGrey,
        marginTop: 2,
    },
      amount: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center', // Center the badge
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginBottom: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '500',
    },
    detailsScroll: {
        flex: 1, // Take remaining space
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.darkGrey,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '500',
        textAlign: 'right', // Align value to the right
        flexShrink: 1, // Allow value to shrink if label is long
        marginLeft: 10,
    },
    separator: {
        height: 10, // Space between sections
        // backgroundColor: COLORS.lightGrey,
        marginVertical: 5,
    },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        // borderBottomWidth: 1, // Optional border
        // borderBottomColor: COLORS.lightGrey,
    },
    actionButtonText: {
        marginLeft: 10,
        fontSize: 14,
        color: COLORS.error, // Default to error color (report problem)
        fontWeight: '500',
    },
});