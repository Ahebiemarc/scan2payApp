// File: app/(app)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Switch } from 'react-native';
import { COLORS } from '@/constants/Colors'; // Adjust path
import Animated, { FadeIn } from 'react-native-reanimated';

// Mock notification settings
const mockNotificationSettings = [
    { id: 'payments', label: 'Notifications de paiement reçu', enabled: true },
    { id: 'refunds', label: 'Notifications de remboursement', enabled: true },
    { id: 'promotions', label: 'Promotions et actualités', enabled: false },
    { id: 'security', label: 'Alertes de sécurité', enabled: true },
];

export default function NotificationsScreen() {
    const [settings, setSettings] = React.useState(mockNotificationSettings);

    const toggleSwitch = (id: string) => {
        setSettings(currentSettings =>
            currentSettings.map(setting =>
                setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
            )
        );
        // --- Simulate API Call to save setting ---
        console.log(`Simulating update for notification setting: ${id}`);
        // --- End Simulation ---
    };

    const renderSetting = ({ item }: { item: typeof mockNotificationSettings[0] }) => (
        <Animated.View entering={FadeIn.duration(500)} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Switch
                trackColor={{ false: COLORS.grey, true: COLORS.primaryLight }}
                thumbColor={item.enabled ? COLORS.primary : COLORS.lightGrey}
                ios_backgroundColor={COLORS.grey}
                onValueChange={() => toggleSwitch(item.id)}
                value={item.enabled}
            />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={settings}
                renderItem={renderSetting}
                keyExtractor={item => item.id}
                ListHeaderComponent={<Text style={styles.headerText}>Gérez vos préférences de notification</Text>}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingVertical: 15,
    },
    headerText: {
        fontSize: 16,
        color: COLORS.darkGrey,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
    },
    settingLabel: {
        fontSize: 16,
        color: COLORS.black,
        flex: 1, // Allow text to wrap
        marginRight: 10,
    },
});