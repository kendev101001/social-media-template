import { useAuth } from '@/contexts/AuthContext';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
}

const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true
}: SettingsItemProps) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
        <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>{icon}</View>
            <View style={styles.settingsItemText}>
                <Text style={styles.settingsItemTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
            </View>
        </View>
        {rightElement || (showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#999" />
        ))}
    </TouchableOpacity>
);

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const [pushNotifications, setPushNotifications] = React.useState(true);
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [privateAccount, setPrivateAccount] = React.useState(false);
    const [showActivityStatus, setShowActivityStatus] = React.useState(true);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/login' as Href);
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <SettingsSection title="Account">
                    <SettingsItem
                        icon={<Feather name="user" size={22} color="#000" />}
                        title="Edit Profile"
                        subtitle="Change your profile info"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="lock" size={22} color="#000" />}
                        title="Password and Security"
                        subtitle="Manage your password"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="mail" size={22} color="#000" />}
                        title="Email"
                        subtitle={user?.email || 'Add email'}
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="smartphone" size={22} color="#000" />}
                        title="Phone Number"
                        subtitle="Add phone number"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Privacy Section */}
                <SettingsSection title="Privacy">
                    <SettingsItem
                        icon={<Ionicons name="eye-off-outline" size={22} color="#000" />}
                        title="Private Account"
                        subtitle="Only followers can see your posts"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={privateAccount}
                                onValueChange={setPrivateAccount}
                                trackColor={{ false: '#e0e0e0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <SettingsItem
                        icon={<Feather name="activity" size={22} color="#000" />}
                        title="Activity Status"
                        subtitle="Show when you're active"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={showActivityStatus}
                                onValueChange={setShowActivityStatus}
                                trackColor={{ false: '#e0e0e0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <SettingsItem
                        icon={<MaterialIcons name="block" size={22} color="#000" />}
                        title="Blocked Accounts"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="volume-x" size={22} color="#000" />}
                        title="Muted Accounts"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="eye" size={22} color="#000" />}
                        title="Story Settings"
                        subtitle="Control who can see your stories"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection title="Notifications">
                    <SettingsItem
                        icon={<Ionicons name="notifications-outline" size={22} color="#000" />}
                        title="Push Notifications"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: '#e0e0e0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <SettingsItem
                        icon={<Feather name="mail" size={22} color="#000" />}
                        title="Email Notifications"
                        showChevron={false}
                        rightElement={
                            <Switch
                                value={emailNotifications}
                                onValueChange={setEmailNotifications}
                                trackColor={{ false: '#e0e0e0', true: '#34C759' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <SettingsItem
                        icon={<Feather name="heart" size={22} color="#000" />}
                        title="Likes and Comments"
                        subtitle="Choose notification preferences"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="user-plus" size={22} color="#000" />}
                        title="New Followers"
                        subtitle="Get notified about new followers"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Content & Display Section */}
                <SettingsSection title="Content & Display">
                    <SettingsItem
                        icon={<Ionicons name="language-outline" size={22} color="#000" />}
                        title="Language"
                        subtitle="English"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Ionicons name="moon-outline" size={22} color="#000" />}
                        title="Dark Mode"
                        subtitle="System default"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="download" size={22} color="#000" />}
                        title="Data Saver"
                        subtitle="Reduce data usage"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Support Section */}
                <SettingsSection title="Support">
                    <SettingsItem
                        icon={<Feather name="help-circle" size={22} color="#000" />}
                        title="Help Center"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="flag" size={22} color="#000" />}
                        title="Report a Problem"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="file-text" size={22} color="#000" />}
                        title="Terms of Service"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="shield" size={22} color="#000" />}
                        title="Privacy Policy"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* About Section */}
                <SettingsSection title="About">
                    <SettingsItem
                        icon={<Feather name="info" size={22} color="#000" />}
                        title="About"
                        subtitle="Version 1.0.0"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon={<Feather name="share-2" size={22} color="#000" />}
                        title="Tell a Friend"
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Feather name="log-out" size={22} color="#FF3B30" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Logged in as {user?.username}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    section: {
        marginTop: 24,
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    sectionContent: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#dbdbdb',
    },

    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },

    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    iconContainer: {
        width: 32,
        alignItems: 'center',
    },

    settingsItemText: {
        marginLeft: 12,
        flex: 1,
    },

    settingsItemTitle: {
        fontSize: 16,
        color: '#000',
    },

    settingsItemSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },

    logoutSection: {
        marginTop: 32,
        marginHorizontal: 16,
    },

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
        gap: 8,
    },

    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },

    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },

    footerText: {
        fontSize: 12,
        color: '#999',
    },
});