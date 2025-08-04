// ============================================================
// File: app/(tabs)/qr-payment.tsx
// Description: QR Code generation (Marchand) or scanning (Client).
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import QRCode from 'react-native-qrcode-svg'; // For displaying QR codes
import { CameraView, useCameraPermissions } from 'expo-camera'; // For scanning
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/Colors'; 
import { useAuth } from '@/contexts/AuthContext';
import { usePayment } from '@/contexts/PaymentContext'; // Import usePayment context
import { CreatePaymentDto } from '@/types/dto'; // Import DTO for payment
import { useQrCode } from '@/contexts/QrCodeContext'; // <-- Importez useQrCode
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRPaymentScreen() {
    const { user } = useAuth();
    const { processQrPayment, isProcessing, error } = usePayment(); // Use payment context
    const { qrCode, loading: loadingQrCode, refetchQrCode } = useQrCode(); // <-- Utilisez useQrCode
    const router = useRouter();
    const isMarchand = user?.userType === 'Marchand';

    // --- State for QR Scanner (Client) ---
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedQrData, setScannedQrData] = useState<string | null>(null); // To store scanned QR data
    const [isEnteringAmount, setIsEnteringAmount] = useState(false); // To show amount input screen
    const [paymentAmount, setPaymentAmount] = useState(''); // State for payment amount input

    // --- Removed static qrValue, now using qrCodeImage from context ---
    // const [qrValue, setQrValue] = useState(`SCAN2PAY_MARCHAND_${user?.email || 'UNKNOWN'}`);

    // Reset scanner and payment states when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setScanned(false);
            setShowScanner(false); // Ensure scanner is closed initially
            setScannedQrData(null); // Reset scanned QR data
            setIsEnteringAmount(false); // Reset amount entry screen
            setPaymentAmount(''); // Clear amount input

            // Refetch QR code for merchant if necessary
            if (isMarchand) {
                refetchQrCode(); // <-- Appel à refetchQrCode pour le marchand
            }
            return () => {
                // Optional cleanup if needed when screen goes out of focus
            };
        }, [isMarchand, refetchQrCode]) // Dépendance à refetchQrCode
    );

    // --- Camera Permission Handling ---
    const handleRequestPermission = async () => {
        const { status } = await requestPermission();
        if (status === 'granted') {
            setShowScanner(true);
            setScanned(false); // Reset scanned state when opening scanner
        } else {
            Alert.alert(
                'Permission refusée',
                'L\'accès à la caméra est nécessaire pour scanner les QR codes. Veuillez l\'activer dans les paramètres de votre téléphone.',
                [{ text: "OK" }]
            );
        }
    };

    // --- QR Code Scan Handler ---
    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        setShowScanner(false); // Close scanner after scan
        console.log("Scanned Data:", data);

        // Validate QR code format
        if (data && data.startsWith('SCAN2PAY_MARCHANDID_')) {
            setScannedQrData(data); // Store the raw QR data
            setIsEnteringAmount(true); // Show amount input screen
        } else {
            Alert.alert(
                'QR Code Invalide',
                'Ce QR code ne semble pas être un code Scan2Pay valide.',
                [{ text: "OK", onPress: () => setScanned(false) }] // Allow rescanning
            );
        }
    };

    // --- Handle Amount Input Change ---
    const handleAmountChange = (text: string) => {
        const numericValue = text.replace(/[^0-9.,]/g, '').replace(',', '.');
        setPaymentAmount(numericValue);
    };

    // --- Process Payment after Amount Entry ---
    const handleConfirmPayment = async () => {
        if (!scannedQrData) {
            Alert.alert("Erreur", "Aucun QR code scanné. Veuillez scanner un code à nouveau.");
            return;
        }

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Erreur", "Veuillez entrer un montant valide pour le paiement.");
            return;
        }

        const paymentData: CreatePaymentDto = {
            qrCodeData: scannedQrData,
            amount: amount,
        };

        const transaction = await processQrPayment(paymentData);

        if (transaction) {
            // PaymentContext already shows success alert and refetches wallet
            // Reset state to go back to initial scan screen
            setScannedQrData(null);
            setPaymentAmount('');
            setIsEnteringAmount(false);
            // Optionally navigate back or to a success screen
            // router.back();
        } else {
            // PaymentContext already shows error alert
            // Keep the amount entry screen open to allow retry or cancel
        }
    };

    // --- Render Content ---

    // 1. Loading camera permissions (Client)
    if (!permission && !isMarchand) {
        return (
            <SafeAreaView style={styles.centerContainer}edges={['bottom', 'left', 'right']}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    // 2. Request camera permissions (Client)
    if (!permission?.granted && !isMarchand && !showScanner && !isEnteringAmount) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="camera-reverse-outline" size={60} color={COLORS.darkGrey} style={{ marginBottom: 20 }} />
                <Text style={styles.infoText}>L'accès à la caméra est requis pour scanner.</Text>
                <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>Autoriser la Caméra</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. Render Scanner for Client
    if (showScanner && !isMarchand) {
        return (
            <View  style={styles.scannerContainer}>
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.overlay}>
                    <View style={styles.scanMarker}>
                        <View style={styles.scanMarkerCornerTopLeft} />
                        <View style={styles.scanMarkerCornerTopRight} />
                        <View style={styles.scanMarkerCornerBottomLeft} />
                        <View style={styles.scanMarkerCornerBottomRight} />
                    </View>
                    <Text style={styles.scanText}>Visez le QR Code du marchand</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
                    <Ionicons name="close-circle" size={40} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        );
    }

    // 4. Render Amount Entry Screen for Client
    if (isEnteringAmount && !isMarchand && scannedQrData) {
        return (
            <Animated.View entering={SlideInDown.duration(500)} style={styles.centerContainer}>
                <Ionicons name="wallet-outline" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Saisir le Montant</Text>
                <Text style={styles.infoText}>Combien souhaitez-vous payer ?</Text>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        value={paymentAmount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.darkGrey}
                    />
                    <Text style={styles.currencySymbol}>€</Text>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.button, isProcessing && styles.buttonDisabled]}
                    onPress={handleConfirmPayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                            <Text style={styles.buttonText}>Confirmer le Paiement</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                        setIsEnteringAmount(false);
                        setScannedQrData(null);
                        setPaymentAmount('');
                        setScanned(false); // Allow re-scanning after cancelling
                    }}
                    disabled={isProcessing}
                >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // 5. Render QR Generator for Marchand
    if (isMarchand) {
        if (loadingQrCode) { // <-- Afficher un indicateur de chargement pour le QR code du marchand
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.infoText}>Chargement de votre QR Code...</Text>
                </View>
            );
        }

        if (!qrCode?.qrCodeData || !qrCode?.qrCodeData) { // <-- Gérer le cas où le QR code n'est pas disponible
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="warning-outline" size={60} color={COLORS.error} style={{ marginBottom: 20 }} />
                    <Text style={styles.title}>QR Code Non Disponible</Text>
                    <Text style={styles.infoText}>Impossible de charger votre QR Code. Veuillez réessayer plus tard ou contacter le support.</Text>
                    <TouchableOpacity style={styles.button} onPress={refetchQrCode}>
                        <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
                        <Text style={styles.buttonText}>Recharger</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        
        return (
            <Animated.View entering={FadeIn.duration(500)} style={styles.centerContainer}>
                <Text style={styles.title}>Votre QR Code de Paiement</Text>
                <View style={styles.qrCodeContainer}>
                    <QRCode
                        value={qrCode.qrCodeData} // <-- Utilisez qrCodeImage.data ici
                        size={250}
                        logoBackgroundColor='transparent'
                        backgroundColor={COLORS.white}
                        color={COLORS.black}
                    />
                </View>
                <Text style={styles.infoText}>Montrez ce code à votre client pour recevoir un paiement.</Text>
                <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Info", "La génération dynamique de QR Code (ex: avec montant spécifique) nécessitera une intégration API.")}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>Plus d'infos</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // 6. Render Button to Open Scanner for Client (Initial state)
    if (!isMarchand && !showScanner && !isEnteringAmount) {
        return (
            <Animated.View entering={FadeIn.duration(500)} style={styles.centerContainer}>
                <Ionicons name="scan-circle-outline" size={100} color={COLORS.primary} style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Prêt à Payer ?</Text>
                <Text style={styles.infoText}>Appuyez sur le bouton pour scanner le QR Code du marchand.</Text>
                <TouchableOpacity style={styles.button} onPress={() => { setShowScanner(true); setScanned(false); }}>
                    <Ionicons name="camera-outline" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>Scanner un QR Code</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return null; // Should not reach here
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanMarker: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    scanMarkerCorner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.primary,
        borderWidth: 4,
    },
    scanMarkerCornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 10,
    },
    scanMarkerCornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 10,
    },
    scanMarkerCornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 10,
    },
    scanMarkerCornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 10,
    },
    scanText: {
        marginTop: 30,
        color: COLORS.white,
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 15,
    },
    qrCodeContainer: {
        padding: 15,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 4,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.darkGrey,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    buttonDisabled: {
        backgroundColor: COLORS.grey,
        elevation: 0,
        shadowOpacity: 0,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '80%',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.grey,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'right',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginLeft: 5,
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    cancelButtonText: {
        color: COLORS.darkGrey,
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 15,
    },
});