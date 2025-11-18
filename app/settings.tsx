import { useAuth } from '@/contexts/AuthContext';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React, { useState } from 'react';
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

export default function SettingsScreen() {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [privateAccount, setPrivateAccount] = useState(false);
    const [activityStatus, setActivityStatus] = useState(true);
    const [saveOriginalPhotos, setSaveOriginalPhotos] = useState(true);

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

    const SettingItem = ({
        icon,
        title,
        subtitle,
        onPress,
        showArrow = true,
        rightElement
    }: {
        icon: React.ReactNode;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        showArrow?: boolean;
        rightElement?: React.ReactNode;
    }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress && !rightElement}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>{icon}</View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement || (showArrow && <Ionicons name="chevron-forward" size={20} color="#999" />)}
        </TouchableOpacity>
    );

    const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <SettingSection title="Account">
                    <SettingItem
                        icon={<Ionicons name="person-outline" size={22} color="#000" />}
                        title="Edit Profile"
                        subtitle="Change photo, name, bio"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Ionicons name="lock-closed-outline" size={22} color="#000" />}
                        title="Password & Security"
                        subtitle="Change password, 2FA"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<MaterialIcons name="verified" size={22} color="#3897F0" />}
                        title="Verification"
                        subtitle="Apply for verification badge"
                        onPress={() => { }}
                    />
                </SettingSection>

                {/* Privacy Section */}
                <SettingSection title="Privacy">
                    <SettingItem
                        icon={<Ionicons name="lock-closed-outline" size={22} color="#000" />}
                        title="Private Account"
                        subtitle="Only followers can see your posts"
                        showArrow={false}
                        rightElement={
                            <Switch
                                value={privateAccount}
                                onValueChange={setPrivateAccount}
                                trackColor={{ false: '#ccc', true: '#3897F0' }}
                            />
                        }
                    />
                    <SettingItem
                        icon={<Ionicons name="eye-off-outline" size={22} color="#000" />}
                        title="Activity Status"
                        subtitle="Show when you're active"
                        showArrow={false}
                        rightElement={
                            <Switch
                                value={activityStatus}
                                onValueChange={setActivityStatus}
                                trackColor={{ false: '#ccc', true: '#3897F0' }}
                            />
                        }
                    />
                    <SettingItem
                        icon={<Ionicons name="people-outline" size={22} color="#000" />}
                        title="Blocked Accounts"
                        subtitle="Manage blocked users"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Feather name="at-sign" size={22} color="#000" />}
                        title="Mentions"
                        subtitle="Who can mention you"
                        onPress={() => { }}
                    />
                </SettingSection>

                {/* Notifications Section */}
                <SettingSection title="Notifications">
                    <SettingItem
                        icon={<Ionicons name="notifications-outline" size={22} color="#000" />}
                        title="Push Notifications"
                        subtitle="Likes, comments, and more"
                        showArrow={false}
                        rightElement={
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#ccc', true: '#3897F0' }}
                            />
                        }
                    />
                    <SettingItem
                        icon={<Ionicons name="mail-outline" size={22} color="#000" />}
                        title="Email Notifications"
                        subtitle="News and updates"
                        onPress={() => { }}
                    />
                </SettingSection>

                {/* Content Section */}
                <SettingSection title="Content">
                    <SettingItem
                        icon={<Ionicons name="bookmark-outline" size={22} color="#000" />}
                        title="Saved Posts"
                        subtitle="Posts you've saved"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Ionicons name="heart-outline" size={22} color="#000" />}
                        title="Posts You've Liked"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Ionicons name="download-outline" size={22} color="#000" />}
                        title="Save Original Photos"
                        subtitle="Save uncompressed photos"
                        showArrow={false}
                        rightElement={
                            <Switch
                                value={saveOriginalPhotos}
                                onValueChange={setSaveOriginalPhotos}
                                trackColor={{ false: '#ccc', true: '#3897F0' }}
                            />
                        }
                    />
                </SettingSection>

                {/* Support Section */}
                <SettingSection title="Support">
                    <SettingItem
                        icon={<Ionicons name="help-circle-outline" size={22} color="#000" />}
                        title="Help Center"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Ionicons name="information-circle-outline" size={22} color="#000" />}
                        title="About"
                        subtitle="Version 1.0.0"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon={<Ionicons name="document-text-outline" size={22} color="#000" />}
                        title="Terms & Privacy Policy"
                        onPress={() => { }}
                    />
                </SettingSection>

                {/* Account Actions */}
                <View style={styles.accountActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Add Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                {/* Footer */}
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    sectionContent: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#dbdbdb',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#000',
    },
    settingSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    accountActions: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    actionButton: {
        backgroundColor: '#3897F0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 16,
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff3b30',
        alignItems: 'center',
    },
    logoutText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 13,
        color: '#999',
    },
});