import PostCard from '@/components/PostCard';
import { usePosts } from '@/hooks/usePosts';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
    const { user, token } = useAuth();
    const { posts, setPosts, handleLike, handleComment } = usePosts();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFeed = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/feed`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            } else {
                Alert.alert('Error', 'Failed to load feed');
            }
        } catch (error) {
            console.error('Feed error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFeed();
    }, []);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {posts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No posts yet</Text>
                    <Text style={styles.emptySubtext}>Follow users to see their posts here</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onLike={handleLike}
                            onComment={handleComment}
                            currentUserId={user!.id}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingVertical: 10,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
    },
});