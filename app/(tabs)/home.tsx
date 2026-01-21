import PostCard from '@/components/PostCard';
import { usePosts } from '@/contexts/PostsContext';
import React, { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
    const { user } = useAuth();
    const {
        feedPosts,
        fetchFeed,
        toggleLike,
        addComment,
        loading,
        refreshing,
        toggleBookmark,
        bookmarkedPosts
    } = usePosts();

    useEffect(() => {
        fetchFeed();
    }, []);

    const onRefresh = useCallback(() => {
        fetchFeed();
    }, []);

    if (loading || !user) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {feedPosts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No posts yet</Text>
                    <Text style={styles.emptySubtext}>Follow users to see their posts here</Text>
                </View>
            ) : (
                <FlatList
                    data={feedPosts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onLike={toggleLike}
                            onComment={addComment}
                            onBookmark={toggleBookmark}
                            currentUserId={user.id}
                            isBookmarked={bookmarkedPosts.some(p => p.id === item.id)}
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
        backgroundColor: 'white'
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