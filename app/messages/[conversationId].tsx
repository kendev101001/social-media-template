import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { Message } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConversationScreen() {
    const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
    const { user } = useAuth();
    const {
        messages,
        currentConversation,
        loading,
        sendingMessage,
        fetchMessages,
        sendMessage,
        setCurrentConversation,
        joinConversation,
        leaveConversation,
    } = useMessages();

    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
            joinConversation(conversationId);
        }
        return () => {
            if (conversationId) leaveConversation(conversationId);
            setCurrentConversation(null);
        };
    }, [conversationId, fetchMessages, joinConversation, leaveConversation, setCurrentConversation]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || sendingMessage || !conversationId) return;
        const content = inputText.trim();
        setInputText('');
        await sendMessage(conversationId, content);
    };

    const getOtherParticipant = () => {
        return currentConversation?.participants.find((p) => p.id !== user?.id);
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isOwnMessage = item.senderId === user?.id;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDate =
            index === 0 ||
            new Date(item.createdAt).toDateString() !== new Date(prevMessage?.createdAt ?? '').toDateString();

        return (
            <View>
                {showDate && (
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>
                            {new Date(item.createdAt).toLocaleDateString([], {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.messageContainer,
                        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                    ]}
                >
                    <View
                        style={[
                            styles.messageBubble,
                            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                            ]}
                        >
                            {item.content}
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.messageTime,
                            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                        ]}
                    >
                        {formatMessageTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    const otherParticipant = getOtherParticipant();

    if (loading && messages.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Loading...</Text>
                    </View>
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

                <TouchableOpacity
                    style={styles.headerInfo}
                    onPress={() => {
                        if (otherParticipant) {
                            router.push({
                                pathname: '/(tabs)/profile/[userId]',
                                params: { userId: otherParticipant.id },
                            });
                        }
                    }}
                >
                    {otherParticipant && (
                        <>
                            <View style={styles.headerAvatar}>
                                <Text style={styles.headerAvatarText}>
                                    {otherParticipant.username.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>
                                    {otherParticipant.name || `@${otherParticipant.username}`}
                                </Text>
                                {otherParticipant.name && (
                                    <Text style={styles.headerSubtitle}>@{otherParticipant.username}</Text>
                                )}
                            </View>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.headerRight} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
                        </View>
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Message..."
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!sendingMessage}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, sendingMessage && styles.buttonDisabled]}
                        onPress={handleSend}
                        disabled={sendingMessage}
                    >
                        <Text style={styles.sendButtonText}>{sendingMessage ? '...' : 'Send'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb' },
    backButton: { padding: 4, marginRight: 8 },
    headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    headerAvatarText: { fontSize: 16, fontWeight: '600', color: '#666' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
    headerSubtitle: { fontSize: 13, color: '#666' },
    headerRight: { width: 32 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    keyboardAvoid: { flex: 1 },
    messagesList: { padding: 16, flexGrow: 1 },
    dateContainer: { alignItems: 'center', marginVertical: 16 },
    dateText: { fontSize: 12, color: '#999', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    messageContainer: { marginVertical: 4, maxWidth: '80%' },
    ownMessageContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    otherMessageContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
    ownMessageBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    otherMessageBubble: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 16, lineHeight: 20 },
    ownMessageText: { color: '#fff' },
    otherMessageText: { color: '#000' },
    messageTime: { fontSize: 11, marginTop: 4 },
    ownMessageTime: { color: '#999' },
    otherMessageTime: { color: '#999' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#333' },
    emptySubtext: { fontSize: 14, color: '#666', marginTop: 4 },
    inputContainer: { flexDirection: 'row', marginBottom: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
    sendButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 20 },
    sendButtonText: { color: '#fff', fontWeight: '600' },
    buttonDisabled: { opacity: 0.6 },
});