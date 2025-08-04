// File: app/(app)/integrations.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';
import { usePaymentMethods } from '@/contexts/PaymentMethodContext'; // Importez le hook
import { PaymentMethodDto } from '@/types/dto'; // Importez le DTO
import AddPaymentMethodModal from '@/components/AddPaymentMethodModal'; // Importez la modale
import { useAuth } from '@/contexts/AuthContext'; // Pour déterminer si c'est un marchand

// Mock integration data (pour les intégrations tierces comme Stripe, PayPal)
const mockIntegrations = [
    { id: 'stripe', name: 'Stripe', description: 'Acceptez les paiements par carte bancaire.', icon: 'card-outline', connected: true, color: '#6772e5' },
    { id: 'paypal', name: 'PayPal', description: 'Connectez votre compte PayPal.', icon: 'logo-paypal', connected: false, color: '#003087' },
    { id: 'orange', name: 'Orange Money', description: 'Liez votre compte Orange Money (si disponible).', icon: 'call-outline', connected: false, color: '#FF7900' },
    // Ajoutez plus d'intégrations potentielles
];

export default function IntegrationsScreen() {
    const { user } = useAuth();
    const isMarchand = user?.userType === 'Marchand';

    // Utilisation du hook usePaymentMethods
    const { paymentMethods, loading: paymentMethodsLoading, refetchPaymentMethods, setDefaultMethod, deleteMethod } = usePaymentMethods();
    const [isAddMethodModalVisible, setAddMethodModalVisible] = useState(false);
    const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null); // Pour le loader de suppression

    // Logique de simulation pour les intégrations tierces (non liées aux méthodes de paiement de l'utilisateur)
    const handleConnectToggle = (id: string, currentStatus: boolean) => {
        Alert.alert("Info", `Simulation: ${currentStatus ? 'Déconnexion' : 'Connexion'} de ${id}... (Logique API requise)`);
    };

    // Gérer la suppression d'une méthode de paiement
    const handleDeleteMethod = async (id: string) => {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        setDeletingMethodId(id); // Active le loader pour cet élément
                        try {
                            await deleteMethod(id);
                            Alert.alert("Succès", "Méthode de paiement supprimée.");
                        } catch (error) {
                            console.error("Erreur lors de la suppression:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la méthode de paiement.");
                        } finally {
                            setDeletingMethodId(null); // Désactive le loader
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    // Gérer la définition d'une méthode par défaut
    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultMethod(id);
            Alert.alert("Succès", "Méthode de paiement définie par défaut.");
        } catch (error) {
            console.error("Erreur lors de la définition par défaut:", error);
            Alert.alert("Erreur", "Impossible de définir cette méthode comme par défaut.");
        }
    };

    // Rendu pour chaque intégration tierce
    const renderIntegration = ({ item }: { item: typeof mockIntegrations[0] }) => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.integrationItem}>
            <Ionicons name={item.icon as any} size={30} color={item.color || COLORS.primary} style={styles.integrationIcon} />
            <View style={styles.integrationDetails}>
                <Text style={styles.integrationName}>{item.name}</Text>
                <Text style={styles.integrationDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={[styles.connectButton, item.connected ? styles.connectedButton : styles.disconnectedButton]}
                onPress={() => handleConnectToggle(item.id, item.connected)}
            >
                <Text style={[styles.connectButtonText, item.connected && styles.connectedButtonText]}>{item.connected ? 'Connecté' : 'Connecter'}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    // Rendu pour chaque méthode de paiement ajoutée par le marchand
    const renderPaymentMethod = ({ item }: { item: PaymentMethodDto }) => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.paymentMethodItem}>
            <Ionicons name={item.type === 'BankAccount' ? 'wallet-outline' : 'card-outline'} size={30} color={COLORS.primary} style={styles.paymentMethodIcon} />
            <View style={styles.paymentMethodDetails}>
                <Text style={styles.paymentMethodName}>{item.provider} - {item.maskedIdentifier}</Text>
                <Text style={styles.paymentMethodDesc}>Type: {item.type}</Text>
            </View>
            <View style={styles.paymentMethodActions}>
                {item.id === deletingMethodId ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                    <>
                        {!item.isDefault && ( // N'affiche le bouton "Définir par défaut" que si ce n'est pas déjà la valeur par défaut
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleSetDefault(item.id)}
                            >
                                <Ionicons name="star-outline" size={20} color={COLORS.darkGrey} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDeleteMethod(item.id)}
                        >
                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Animated.View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.listContent}>
            {isMarchand && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Vos Méthodes de Paiement</Text>
                    {paymentMethodsLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                    ) : (
                        <>
                            {paymentMethods.length > 0 ? (
                                <FlatList
                                    data={paymentMethods}
                                    renderItem={renderPaymentMethod}
                                    keyExtractor={item => item.id}
                                    scrollEnabled={false} // Pour ne pas avoir de scroll interne dans un ScrollView
                                />
                            ) : (
                                <Text style={styles.infoText}>Aucune carte ou compte n'a été ajouté. Ajoutez-en un pour faciliter les retraits !</Text>
                            )}
                            <TouchableOpacity
                                style={styles.addMethodButton}
                                onPress={() => setAddMethodModalVisible(true)}
                            >
                                <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
                                <Text style={styles.addMethodButtonText}>Ajouter une Nouvelle Carte</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>Intégrations Tierces</Text>
                <FlatList
                    data={mockIntegrations}
                    renderItem={renderIntegration}
                    keyExtractor={item => item.id}
                    scrollEnabled={false} // Pour ne pas avoir de scroll interne dans un ScrollView
                />
            </View>

            <AddPaymentMethodModal
                isVisible={isAddMethodModalVisible}
                onClose={() => setAddMethodModalVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingVertical: 15,
        paddingBottom: 50, // Ajoute un padding en bas pour éviter que le dernier élément soit trop proche du bord
    },
    headerText: {
        fontSize: 16,
        color: COLORS.darkGrey,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    sectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        paddingBottom: 10,
    },
    integrationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 2,
    },
    integrationIcon: {
        marginRight: 15,
    },
    integrationDetails: {
        flex: 1,
        marginRight: 10,
    },
    integrationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    integrationDesc: {
        fontSize: 13,
        color: COLORS.darkGrey,
        marginTop: 3,
    },
    connectButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    disconnectedButton: {
        backgroundColor: COLORS.primary,
    },
    connectedButton: {
        backgroundColor: COLORS.lightGrey,
        borderWidth: 1,
        borderColor: COLORS.grey,
    },
    connectButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    connectedButtonText: {
        color: COLORS.darkGrey,
    },
    // Styles for user's payment methods
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 2,
    },
    paymentMethodIcon: {
        marginRight: 15,
    },
    paymentMethodDetails: {
        flex: 1,
    },
    paymentMethodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    paymentMethodDesc: {
        fontSize: 13,
        color: COLORS.darkGrey,
        marginTop: 3,
    },
    paymentMethodActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 5,
        marginLeft: 10,
    },
    addMethodButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addMethodButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.darkGrey,
        textAlign: 'center',
        paddingVertical: 10,
    },
    loader: {
        marginTop: 20,
    },
    danger: { // Define danger color here if it's meant to be available globally via COLORS
        color: '#FF3B30', // Or a hex code for red
    }
});