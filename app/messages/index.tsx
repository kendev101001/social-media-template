import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Conversation } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
    const { user } = useAuth();
    const { conversations, fetchConversations, loading } = useMessages();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const onRefresh = useCallback(() => {
        fetchConversations();
    }, [fetchConversations]);

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find((p) => p.id !== user?.id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderConversation = ({ item }: { item: Conversation }) => {
        const otherParticipant = getOtherParticipant(item);
        if (!otherParticipant) return null;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() =>
                    router.push({
                        pathname: '/messages/[conversationId]',
                        params: { conversationId: item.id },
                    })
                }
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {otherParticipant.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.username} numberOfLines={1}>
                            {otherParticipant.name || `@${otherParticipant.username}`}
                        </Text>
                        {item.lastMessageAt && (
                            <Text style={styles.time}>{formatDate(item.lastMessageAt)}</Text>
                        )}
                    </View>
                    {item.lastMessage && (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {item.lastMessage.content}
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        );
    };

    if (loading && conversations.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
                contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Start a conversation from someone's profile</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    headerRight: { width: 32 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 22, fontWeight: '600', color: '#666' },
    conversationInfo: { flex: 1, marginRight: 8 },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    username: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
    time: { fontSize: 13, color: '#999' },
    lastMessage: { fontSize: 14, color: '#666' },
    emptyList: { flex: 1 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
});