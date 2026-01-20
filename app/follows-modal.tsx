// app/follows-modal.tsx
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserItem {
    id: string;
    username: string;
    name?: string;
    bio?: string;
}

export default function FollowsModal() {
    const { userId, type } = useLocalSearchParams<{ userId: string; type: 'followers' | 'following' }>();
    const { token } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!userId || !token || !type) return;
            try {
                const endpoint = type === 'followers'
                    ? `${API_URL}/users/${userId}/followers`
                    : `${API_URL}/users/${userId}/following`;
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userId, type, token]);

    const handleUserPress = (selectedUserId: string) => {
        // Close the modal first
        router.back();
        // Small delay to ensure modal is closed, then navigate
        setTimeout(() => {
            // Navigate to the profile within the tabs structure
            router.push({
                pathname: '/(tabs)/profile/[userId]',
                params: { userId: selectedUserId }
            });
        }, 100);
    };

    const renderUserItem = ({ item }: { item: UserItem }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item.id)}>
            <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                {item.name && <Text style={styles.name}>{item.name}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {type === 'followers' ? 'Followers' : 'Following'}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : users.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb' },
    closeButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    headerSpacer: { width: 36 }, // Same as close button for centering
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#666' },
    listContent: { paddingVertical: 8 },
    userItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    userAvatarText: { fontSize: 20, fontWeight: '600', color: '#666' },
    userInfo: { flex: 1 },
    username: { fontSize: 16, fontWeight: '600', color: '#000' },
    name: { fontSize: 14, color: '#666', marginTop: 2 },
});