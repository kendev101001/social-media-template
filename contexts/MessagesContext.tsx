
import { API_URL } from '@/config/api';
import { Conversation, Message } from '@/types/types';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface MessagesContextType {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];  // For the current conversation
    loading: boolean;
    sendingMessage: boolean;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    getOrCreateConversation: (participantId: string) => Promise<Conversation>;
    setCurrentConversation: (conversation: Conversation | null) => void;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

const getSocketUrl = () => API_URL.replace('/api', '');

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Socket.IO connection
    useEffect(() => {
        if (!token || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socketUrl = getSocketUrl();
        socketRef.current = io(socketUrl, {
            auth: { token },
            transports: ['websocket'],
        });

        const socket = socketRef.current;
        socket.on('connect', () => console.log('Socket connected'));
        socket.on('disconnect', () => console.log('Socket disconnected'));
        socket.on('connect_error', (error) => console.error('Socket error:', error));

        socket.on('new_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('conversation_updated', ({ conversationId, lastMessage }) => {
            setConversations(prev =>
                prev
                    .map(conv =>
                        conv.id === conversationId
                            ? { ...conv, lastMessage, lastMessageAt: lastMessage.createdAt }
                            : conv
                    )
                    .sort((a, b) => {
                        const aTime = a.lastMessageAt || a.createdAt;
                        const bTime = b.lastMessageAt || b.createdAt;
                        return new Date(bTime).getTime() - new Date(aTime).getTime();
                    })
            );
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, user]);

    const fetchConversations = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data: Conversation[] = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Fetch conversations error:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchMessages = useCallback(async (conversationId: string) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data: Message[] = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const sendMessage = useCallback(async (conversationId: string, content: string) => {
        if (!socketRef.current || !user || !content.trim()) return;
        setSendingMessage(true);
        try {
            await new Promise<void>((resolve, reject) => {
                socketRef.current!.emit(
                    'send_message',
                    { conversationId, content },
                    (response: { success?: boolean; error?: string }) => {
                        if (response.success) resolve();
                        else reject(new Error(response.error || 'Failed to send'));
                    }
                );
            });
        } finally {
            setSendingMessage(false);
        }
    }, [user]);

    const getOrCreateConversation = useCallback(async (participantId: string): Promise<Conversation> => {
        if (!token) throw new Error('Not authenticated');
        const response = await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ participantId }),
        });
        if (!response.ok) throw new Error(await response.json().then(e => e.message || 'Failed to create conversation'));
        const conversation: Conversation = await response.json();
        setConversations(prev => prev.some(c => c.id === conversation.id) ? prev : [conversation, ...prev]);
        return conversation;
    }, [token]);

    const joinConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('join_conversation', conversationId);
    }, []);

    const leaveConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('leave_conversation', conversationId);
    }, []);

    return (
        <MessagesContext.Provider value={{
            conversations,
            currentConversation,
            messages,
            loading,
            sendingMessage,
            fetchConversations,
            fetchMessages,
            sendMessage,
            getOrCreateConversation,
            setCurrentConversation,
            joinConversation,
            leaveConversation,
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) throw new Error('useMessages must be used within MessagesProvider');
    return context;
}