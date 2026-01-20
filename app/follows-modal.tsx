import UserCard from '@/components/UserCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FollowsModal() {
    const { userId, type } = useLocalSearchParams<{ userId: string; type: 'followers' | 'following' }>();
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
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
            router.push({
                pathname: '/(tabs)/profile/[userId]',
                params: { userId: selectedUserId }
            });
        }, 100);
    };

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
                    renderItem={({ item }) => (
                        <UserCard
                            user={item}
                            currentUserId={currentUser?.id || ''}
                            showFollowButton={true}
                            onPress={handleUserPress}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb'
    },
    closeButton: {
        padding: 4
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600'
    },
    headerSpacer: {
        width: 36
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 16,
        color: '#666'
    },
    listContent: {
        paddingVertical: 8
    },
});